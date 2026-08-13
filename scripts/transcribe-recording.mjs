/**
 * Transcribe one track of a stored recording, off-platform.
 *
 * WHY THIS EXISTS
 * The app runs on Vercel Hobby, whose function ceiling is a hard 300 seconds —
 * asking for more fails the build, it is not clamped. One track of a long
 * lesson can take longer than that on whisper-1 with word timestamps, and word
 * timestamps are not optional: the talk-time split and every speaking metric
 * are computed from them. Akio's 47-minute lesson with Kazuyuki died exactly
 * there, twice, with a 504 at 301 seconds.
 *
 * So the slow half runs here, where nothing is timing it, and the words are
 * written to the same transcript.json the platform reads. Afterwards a single
 * call to /api/admin/recover-recording finds every track already transcribed
 * and only has to write the recap — which fits in 300s comfortably.
 *
 * This produces byte-identical output to lib/whisper's transcribeOne: same
 * model, same parameters, same hallucination filter. If that file changes, this
 * one has to change with it.
 *
 * USAGE
 *   node scripts/transcribe-recording.mjs <recordingId> <track> [languageCode]
 *   node scripts/transcribe-recording.mjs 294352a6-… tab en
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY
 * in .env.local. OPENAI_API_KEY is marked sensitive in Vercel and cannot be
 * read back from there — paste it in locally to run this.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function env() {
  const out = {}
  for (const line of readFileSync(path.join(ROOT, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

// Mirrors keepConfidentWords in lib/whisper.ts — Whisper does not return
// nothing for silence, it invents fluent text, so untrusted segments go.
const NO_SPEECH_MAX = 0.6
const AVG_LOGPROB_MIN = -1.0
function keepConfidentWords(words, segments) {
  if (!segments.length) return words
  const trusted = segments.filter(
    (s) => (Number(s.no_speech_prob) || 0) < NO_SPEECH_MAX && (Number(s.avg_logprob) || 0) > AVG_LOGPROB_MIN,
  )
  if (!trusted.length) return []
  return words.filter((w) =>
    trusted.some((s) => w.start >= (Number(s.start) || 0) - 0.05 && w.start <= (Number(s.end) || 0) + 0.05),
  )
}

async function main() {
  const [recordingId, track, language] = process.argv.slice(2)
  if (!recordingId || !track) {
    console.error('usage: node scripts/transcribe-recording.mjs <recordingId> <track:mic|tab> [languageCode]')
    process.exit(1)
  }

  const E = env()
  const url = E.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const key = E.SUPABASE_SERVICE_ROLE_KEY
  const openai = E.OPENAI_API_KEY
  for (const [name, v] of [['NEXT_PUBLIC_SUPABASE_URL', url], ['SUPABASE_SERVICE_ROLE_KEY', key], ['OPENAI_API_KEY', openai]]) {
    if (!v) { console.error(`Missing ${name} in .env.local`); process.exit(1) }
  }

  const BUCKET = 'lesson-recordings'
  const store = (p) => `${url}/storage/v1/object/${BUCKET}/${p}`
  const auth = { apikey: key, Authorization: `Bearer ${key}` }

  console.log(`↓ downloading ${recordingId}/${track}.webm`)
  const audioRes = await fetch(store(`${recordingId}/${track}.webm`), { headers: auth })
  if (!audioRes.ok) { console.error(`download failed (${audioRes.status})`); process.exit(1) }
  const audio = await audioRes.blob()
  console.log(`  ${(audio.size / 1024 / 1024).toFixed(1)}MB`)

  const form = new FormData()
  form.append('file', audio, 'track.webm')
  form.append('model', 'whisper-1')
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'word')
  if (language) form.append('language', language)

  console.log('→ whisper-1 (no timeout here; this is the part Vercel could not finish)')
  const t0 = Date.now()
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${openai}` },
    body: form,
  })
  if (!res.ok) { console.error(`whisper failed (${res.status}): ${await res.text()}`); process.exit(1) }
  const json = await res.json()
  console.log(`  ${Math.round((Date.now() - t0) / 1000)}s`)

  const raw = (Array.isArray(json.words) ? json.words : [])
    .map((w) => ({ text: String(w.word ?? w.text ?? '').trim(), start: Number(w.start) || 0, end: Number(w.end) || 0 }))
    .filter((w) => w.text)
  const words = keepConfidentWords(raw, Array.isArray(json.segments) ? json.segments : [])
  console.log(`  ${raw.length} words, ${words.length} kept after the hallucination filter`)

  // Merge into whatever is already cached rather than replacing it — the other
  // track may already have been transcribed and paid for.
  let cache = { v: 1, language: language ?? null, createdAt: new Date().toISOString(), tracks: {} }
  const existing = await fetch(store(`${recordingId}/transcript.json`), { headers: auth })
  if (existing.ok) {
    try {
      const parsed = JSON.parse(await existing.text())
      if (parsed?.v === 1 && parsed.tracks) cache = parsed
    } catch { /* unreadable cache is the same as none */ }
  }
  cache.tracks[track] = words
  cache.language = language ?? cache.language ?? null

  const put = await fetch(store(`${recordingId}/transcript.json`), {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json', 'x-upsert': 'true' },
    body: JSON.stringify(cache),
  })
  if (!put.ok) { console.error(`could not save transcript (${put.status}): ${await put.text()}`); process.exit(1) }

  console.log(`✓ cached tracks: ${Object.keys(cache.tracks).join(', ')}`)
  console.log('Now POST /api/admin/recover-recording once more to write the recap.')
}

main().catch((e) => { console.error(e); process.exit(1) })
