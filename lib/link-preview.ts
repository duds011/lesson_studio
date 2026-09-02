/**
 * What a pasted URL is, without making the teacher type it.
 *
 * She pastes a YouTube link and gets the video's real title and thumbnail; she
 * pastes an article and gets its headline and the site's name. Typing a title
 * for every material is the tax that stops a library like this from ever
 * getting filled.
 *
 * This fetches a URL the teacher supplied, from our server, so it is written
 * defensively: only http(s), never a private address, a hard timeout, and a
 * read cap so a huge page cannot tie up a function. Anything that fails falls
 * back to a title made from the URL itself — a material with a plain title is
 * still a material, and a save that refuses because a site was slow is not.
 */

export type LinkPreview = {
  url: string
  title: string
  kind: 'video' | 'article' | 'link'
  site: string | null
  thumbnail: string | null
}

const TIMEOUT_MS = 6000
const MAX_BYTES = 512 * 1024

/** Hosts that are never ours to fetch — loopback, link-local, private ranges. */
function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true
  // Bracketed IPv6 loopback, and the IPv4 forms that matter.
  if (h === '[::1]' || h === '0.0.0.0') return true
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false
  const [a, b] = [Number(m[1]), Number(m[2])]
  return (
    a === 10 || a === 127 || a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  )
}

/** Normalised, or null when this is not a URL we will touch. */
export function safeUrl(raw: string): URL | null {
  const text = String(raw || '').trim()
  if (!text) return null
  // A scheme we do not serve is a rejection, not something to re-prefix.
  // Without this, "file:///etc/passwd" had https:// pasted in front of it and
  // came back as the perfectly valid-looking https://file///etc/passwd.
  if (text.includes('://') && !/^https?:\/\//i.test(text)) return null
  try {
    const u = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (isPrivateHost(u.hostname)) return null
    return u
  } catch {
    return null
  }
}

const YT = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/

/** The YouTube video id, when this is one. Drives the embed in the portal. */
export function youtubeId(url: string): string | null {
  return YT.exec(String(url || ''))?.[1] ?? null
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .trim()
}

function meta(html: string, prop: string): string | null {
  // Either attribute order, single or double quotes.
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'),
  ]
  for (const re of patterns) {
    const m = re.exec(html)
    if (m?.[1]) return decodeEntities(m[1])
  }
  return null
}

/** Last resort: a readable name built from the URL. */
function titleFromUrl(u: URL): string {
  const last = u.pathname.split('/').filter(Boolean).pop() || u.hostname
  return decodeURIComponent(last).replace(/[-_]+/g, ' ').replace(/\.\w{2,4}$/, '').trim() || u.hostname
}

export async function previewLink(raw: string): Promise<LinkPreview | null> {
  const u = safeUrl(raw)
  if (!u) return null

  const site = u.hostname.replace(/^www\./, '')
  const vid = youtubeId(u.href)
  const base: LinkPreview = {
    url: u.href,
    title: titleFromUrl(u),
    kind: vid ? 'video' : 'link',
    site,
    thumbnail: vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : null,
  }

  // YouTube answers oEmbed without us parsing a page of theirs.
  if (vid) {
    try {
      const r = await fetchWithTimeout(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(u.href)}`)
      if (r?.ok) {
        const j: any = await r.json()
        if (j?.title) base.title = String(j.title).slice(0, 200)
        if (j?.thumbnail_url) base.thumbnail = String(j.thumbnail_url)
      }
    } catch { /* the fallback title is already in hand */ }
    return base
  }

  try {
    const res = await fetchWithTimeout(u.href)
    if (!res?.ok) return base
    const type = res.headers.get('content-type') || ''
    if (!/text\/html|application\/xhtml/i.test(type)) return base

    const html = await readCapped(res)
    const title = meta(html, 'og:title') || meta(html, 'twitter:title') ||
      decodeEntities(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i.exec(html)?.[1] || '')
    if (title) base.title = title.slice(0, 200)
    base.thumbnail = meta(html, 'og:image') || meta(html, 'twitter:image')
    base.site = meta(html, 'og:site_name') || site
    // An article is just a link that told us it is one.
    if (meta(html, 'og:type') === 'article') base.kind = 'article'
  } catch { /* fall through to what we already know */ }

  return base
}

async function fetchWithTimeout(url: string): Promise<Response | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        // Sites serve very different HTML to something that looks like a bot.
        'User-Agent': 'Mozilla/5.0 (compatible; LessonStudio/1.0; +https://koku-library.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/** Reads at most MAX_BYTES — the tags we want are in the head. */
async function readCapped(res: Response): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return (await res.text()).slice(0, MAX_BYTES)
  const chunks: Uint8Array[] = []
  let size = 0
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read()
    if (done || !value) break
    chunks.push(value)
    size += value.length
  }
  try { await reader.cancel() } catch { /* already closed */ }

  const buf = new Uint8Array(size)
  let offset = 0
  for (const c of chunks) { buf.set(c, offset); offset += c.length }
  return new TextDecoder('utf-8').decode(buf)
}
