/**
 * The lesson, heard: each vocabulary word and each correction, cut out of the
 * recording as it was actually said.
 *
 * Ported from Lesson Journal, where it does vocabulary only, and extended with
 * the thing a correction needs and a word does not — two voices. A correction
 * has a wrong version and a right one, and they came out of different mouths:
 *
 *   said        the student's own mistake, on the student's track
 *   correction  the teacher saying it properly, on the teacher's track
 *
 * Hearing yourself say it wrong, then hearing it said right, is the whole
 * lesson in three seconds. Neither half is worth much alone.
 *
 * Three things make the find work:
 *
 * 1. Two tracks, one speaker each. There is no diarization to get wrong —
 *    though there IS a mic_is to get wrong, which is why nothing here trusts
 *    it (see below).
 *
 * 2. The cached transcript is in the language the lesson is SPOKEN in, so the
 *    target-language words in it are mangled beyond finding. Each track is
 *    transcribed once more, forced into the language being LEARNED and
 *    prompted with the strings being hunted.
 *
 * 3. That forcing makes Whisper render the other language as the target one
 *    too, so a match can point at a moment where nothing of the sort was said.
 *    Every clip is cut and then transcribed back on its own, and kept only if
 *    it says what it claims to.
 *
 * Whose voice is in the file is recorded in its NAME, not in a column —
 * `<key>--teacher.webm`. That is also the answer to mic_is being wrong: both
 * tracks are searched, the preferred one first, and whichever actually said it
 * is what gets filed. A student's French lessons recorded under a teacher
 * account have mic_is null, which resolves to "the mic is the teacher" and is
 * backwards; a feature that believed it would hand the learner their own
 * mispronunciation as the model to copy.
 *
 * Clips live inside the recording's own folder, so the daily purge removes
 * them with the audio they came from and the 30-day promise stands.
 */
import { spawn } from 'node:child_process'
import { postMultipart, type Part } from '@/lib/long-post'
import { toWhisperLanguage } from '@/lib/whisper'
import { RECORDING_BUCKET, trackPath, transcriptPath } from '@/lib/ext-storage'

export type TimedWord = { text: string; start: number; end: number }
export type Voice = 'teacher' | 'student'
/** vocab = one word; said = the mistake; fixed = the correction. */
export type ClipKind = 'vocab' | 'said' | 'fixed'

export const clipPath = (recordingId: string, kind: ClipKind, key: string, voice: Voice) =>
  `${recordingId}/clips/${kind}-${key}--${voice}.webm`

/** Everything this lesson can be heard saying, by kind and key. */
export type ClipIndex = Record<string, Voice>
export const clipKey = (kind: ClipKind, key: string) => `${kind}:${key}`

const targetTranscriptPath = (recordingId: string, track: string, lang: string) =>
  `${recordingId}/heard-${track}-${lang}.json`

const PAD_BEFORE = 0.25
const PAD_AFTER = 0.35
/** Candidates tried per string per track. Each one costs a transcription. */
const MAX_TRIES = 3
/** A correction's wrong version is a sentence; a clip of one is long enough. */
const MAX_CLIP_SEC = 12

/** Case, accents and punctuation removed; scripts other than Latin survive. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .replace(/[’‘]/g, "'")
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,!?;:…"“”「」『』()（）\[\]{}\-–—~〜、。，．・！？]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Tokens, with the apostrophe treated as a break — l'ami is two tokens. */
const tokens = (s: string) => norm(s).replace(/'/g, " ").split(' ').filter(Boolean)

/**
 * Articles, in the languages this app teaches. One flat set rather than one
 * per language: a token that is an article in French is not a content word in
 * German either, and the phrase being searched for is short enough that a
 * false strip costs a candidate, not a wrong clip — every hit is still checked
 * against the audio afterwards.
 */
const ARTICLES = new Set([
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de',
  'der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'einen',
  'el', 'los', 'las', 'una', 'lo', 'il', 'i', 'gli', 'o', 'os', 'as', 'um', 'uma',
  'the', 'a', 'an', 'to',
])

/**
 * The forms of a phrase worth looking for, best first.
 *
 * A recap stores a French noun with its article — "la commande", "les frites"
 * — because that is how the gender is taught. The teacher, mid-sentence, said
 * "une commande" or "des frites", and an exact search finds neither. On
 * Duarte's restaurant lesson that one mismatch accounted for most of the
 * misses: twelve nouns nobody could hear, all of them said out loud.
 *
 * Also handled: the slash form a recap uses for gendered pairs
 * ("amusant/amusante"), which is two words and never one utterance, and the
 * parenthetical gloss ("la pièce (de théâtre)"), which is an explanation
 * rather than something anybody said.
 */
export function variantsOf(phrase: string): string[] {
  const out: string[] = []
  const add = (v: string) => {
    const t = v.trim()
    if (t && !out.some((x) => norm(x) === norm(t))) out.push(t)
  }

  add(phrase)

  // "la pièce (de théâtre)" → "la pièce"
  const noParens = phrase.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()
  if (noParens) add(noParens)

  // "amusant/amusante" → each side. The whole is never one utterance.
  for (const half of noParens.split('/')) add(half)

  // Each of those again without its leading article.
  for (const v of [...out]) {
    const parts = v.split(/\s+/)
    if (parts.length > 1 && ARTICLES.has(norm(parts[0]))) add(parts.slice(1).join(' '))
  }

  return out
}

/**
 * Every place a phrase appears in a word timeline.
 *
 * Whisper tokenises "l'ami" as one word or two depending on the day, so both
 * sides are flattened the same way and matched over a token stream rather than
 * word for word.
 */
export function findWindows(words: TimedWord[], phrase: string): { start: number; end: number }[] {
  const target = tokens(phrase)
  if (!target.length) return []

  // One flat stream, each token remembering which word it came from.
  const flat: { t: string; start: number; end: number }[] = []
  for (const w of words) {
    const parts = tokens(w.text)
    for (const p of parts) flat.push({ t: p, start: w.start, end: w.end })
  }

  const out: { start: number; end: number }[] = []
  for (let i = 0; i + target.length <= flat.length; i++) {
    let ok = true
    for (let j = 0; j < target.length; j++) {
      if (flat[i + j].t !== target[j]) { ok = false; break }
    }
    if (!ok) continue
    const start = flat[i].start
    const end = flat[i + target.length - 1].end
    if (end > start && end - start <= MAX_CLIP_SEC) out.push({ start, end })
  }
  return out
}

/** Nearest to how long the phrase should take, then latest. */
function rank(windows: { start: number; end: number }[], phrase: string) {
  const n = tokens(phrase).length
  const ideal = 0.42 * n + 0.3
  return [...windows].sort((a, b) => {
    const da = Math.abs((a.end - a.start) - ideal)
    const db = Math.abs((b.end - b.start) - ideal)
    if (Math.abs(da - db) > 0.25) return da - db
    return b.start - a.start
  })
}

function ffmpegPath(): string {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const bin = require('ffmpeg-static')
    if (typeof bin === 'string' && bin) return bin
  } catch { /* fall through to PATH */ }
  return 'ffmpeg'
}

/** One window of a track, re-encoded so the cut lands where it was asked to. */
export function cutClip(source: string, start: number, seconds: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ff = spawn(ffmpegPath(), [
      '-hide_banner', '-loglevel', 'error',
      '-ss', Math.max(0, start).toFixed(3),
      '-t', seconds.toFixed(3),
      '-i', source,
      '-vn', '-ac', '1', '-c:a', 'libopus', '-b:a', '48k',
      '-f', 'webm', 'pipe:1',
    ])
    const chunks: Buffer[] = []
    const errs: Buffer[] = []
    ff.stdout.on('data', (c) => chunks.push(c))
    ff.stderr.on('data', (c) => errs.push(c))
    ff.on('error', reject)
    ff.on('close', (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg exited ${code}: ${Buffer.concat(errs).toString().slice(0, 300)}`))
      resolve(Buffer.concat(chunks))
    })
  })
}

async function whisper(parts: Part[]): Promise<any> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')
  const res = await postMultipart('https://api.openai.com/v1/audio/transcriptions', parts, {
    headers: { Authorization: `Bearer ${key}` },
  })
  if (res.status < 200 || res.status >= 300) throw new Error(`Whisper failed (${res.status}): ${res.text}`)
  return JSON.parse(res.text)
}

/** What one clip actually says, asked of the clip alone. */
async function heardIn(clip: Buffer, lang: string, phrase: string): Promise<string> {
  const json = await whisper([
    { name: 'file', filename: 'clip.webm', contentType: 'audio/webm', body: clip },
    { name: 'model', value: 'whisper-1' },
    { name: 'response_format', value: 'json' },
    { name: 'language', value: lang },
    { name: 'prompt', value: phrase },
  ])
  return String(json.text ?? '')
}

/**
 * Close enough to keep.
 *
 * Containment either way for short strings — a clip of "bonjour" that comes
 * back "Bonjour." is the same clip. A correction is a whole sentence and will
 * never come back word for word, so it passes on overlap instead: most of what
 * was asked for has to be in what was heard.
 */
function saysIt(heard: string, phrase: string): boolean {
  const h = norm(heard), p = norm(phrase)
  if (!h) return false
  if (h.includes(p) || p.includes(h)) return true
  const want = tokens(phrase)
  if (want.length < 4) return false
  const got = new Set(tokens(heard))
  const hits = want.filter((t) => got.has(t)).length
  return hits / want.length >= 0.7
}

/** One track, transcribed in the language being learned. Cached beside it. */
async function heardTrack(
  admin: any, recordingId: string, track: string, lang: string, hints: string[],
): Promise<TimedWord[]> {
  const path = targetTranscriptPath(recordingId, track, lang)
  const cached = await admin.storage.from(RECORDING_BUCKET).download(path)
  if (cached.data) {
    try {
      const parsed = JSON.parse(await cached.data.text())
      if (Array.isArray(parsed?.words)) return parsed.words
    } catch { /* unreadable — redo it */ }
  }

  const blob = await admin.storage.from(RECORDING_BUCKET).download(trackPath(recordingId, track))
  if (!blob.data) throw new Error(`The ${track} track is gone — audio is kept for ${30} days.`)

  const json = await whisper([
    { name: 'file', filename: `${track}.webm`, contentType: 'audio/webm', body: Buffer.from(await blob.data.arrayBuffer()) },
    { name: 'model', value: 'whisper-1' },
    { name: 'response_format', value: 'verbose_json' },
    { name: 'timestamp_granularities[]', value: 'word' },
    { name: 'language', value: lang },
    // Spelling help, not content: the prompt is how "Tschüss" comes back as a
    // word rather than as "chus".
    { name: 'prompt', value: hints.slice(0, 40).join('. ').slice(0, 900) },
  ])

  const words: TimedWord[] = (Array.isArray(json.words) ? json.words : [])
    .map((w: any) => ({ text: String(w.word ?? w.text ?? '').trim(), start: Number(w.start) || 0, end: Number(w.end) || 0 }))
    .filter((w: TimedWord) => w.text)

  await admin.storage.from(RECORDING_BUCKET).upload(
    path, JSON.stringify({ v: 1, track, lang, createdAt: new Date().toISOString(), words }),
    { contentType: 'application/json', upsert: true },
  )
  return words
}

export type Wanted = { kind: ClipKind; key: string; phrase: string; prefer: Voice }
export type Made = { kind: ClipKind; key: string; phrase: string; voice: Voice; start: number; heard: string }
export type Missed = { kind: ClipKind; key: string; phrase: string; why: string }

/**
 * Cut every wanted phrase out of whichever track actually said it.
 *
 * `prefer` decides which track is asked first, not which one is allowed: a
 * correction the teacher reads back in the student's voice is still the
 * student's mistake, and a mic_is that is the wrong way round should cost
 * accuracy, not the whole feature.
 */
export async function attachLessonAudio(
  admin: any,
  opts: {
    recordingId: string
    language: string
    /** Which track holds the teacher. Default from mic_is; both are searched. */
    teacherTrack?: 'mic' | 'tab'
    wanted: Wanted[]
    redo?: boolean
    onProgress?: (line: string) => void
  },
): Promise<{ made: Made[]; missed: Missed[] }> {
  const lang = toWhisperLanguage(opts.language)
  if (!lang) throw new Error(`No language code for ${opts.language}`)
  const say = opts.onProgress ?? (() => {})

  const teacherTrack = opts.teacherTrack ?? 'tab'
  const studentTrack = teacherTrack === 'tab' ? 'mic' : 'tab'
  const trackOf = (v: Voice) => (v === 'teacher' ? teacherTrack : studentTrack)

  const hints = opts.wanted.map((w) => w.phrase)
  const words: Partial<Record<string, TimedWord[]>> = {}
  const local: Partial<Record<string, string>> = {}

  const { writeFile, unlink } = await import('node:fs/promises')
  const { join } = await import('node:path')
  const { tmpdir } = await import('node:os')

  /**
   * The transcript the RECAP was written from.
   *
   * A correction's "said" is a quotation out of this, so this is where it will
   * be found word for word — the target-language pass heard the same seconds
   * differently and spells them differently. Free: it is already paid for and
   * already on disk. Absent for a lesson built before the cache existed.
   */
  let original: Record<string, TimedWord[]> | null | undefined
  const originalWords = async (track: string): Promise<TimedWord[]> => {
    if (original === undefined) {
      try {
        const file = await admin.storage.from(RECORDING_BUCKET).download(transcriptPath(opts.recordingId))
        original = file.data ? (JSON.parse(await file.data.text())?.tracks ?? null) : null
      } catch { original = null }
    }
    return original?.[track] ?? []
  }

  /** A track, transcribed and on disk — ffmpeg cannot seek a pipe. */
  const prepare = async (track: string) => {
    if (!words[track]) {
      say(`  transcribing ${track} in ${lang}…`)
      words[track] = await heardTrack(admin, opts.recordingId, track, lang, hints)
      say(`  ${track}: ${words[track]!.length} words`)
    }
    if (!local[track]) {
      const blob = await admin.storage.from(RECORDING_BUCKET).download(trackPath(opts.recordingId, track))
      if (!blob.data) throw new Error(`The ${track} track is gone.`)
      const file = join(tmpdir(), `${opts.recordingId}-${track}.webm`)
      await writeFile(file, Buffer.from(await blob.data.arrayBuffer()))
      local[track] = file
    }
    return { words: words[track]!, file: local[track]! }
  }

  const made: Made[] = []
  const missed: Missed[] = []

  try {
    for (const want of opts.wanted) {
      const voices: Voice[] = want.prefer === 'teacher' ? ['teacher', 'student'] : ['student', 'teacher']

      // Already done, in either voice? Then leave it alone.
      if (!opts.redo) {
        let have = false
        for (const v of voices) {
          const existing = await admin.storage.from(RECORDING_BUCKET)
            .download(clipPath(opts.recordingId, want.kind, want.key, v))
          if (existing.data) { have = true; break }
        }
        if (have) continue
      }

      let placed = false
      let lastHeard = ''
      const forms = variantsOf(want.phrase)
      for (const voice of voices) {
        const track = trackOf(voice)
        const { words: ws, file } = await prepare(track)
        // The recap's own transcript first for a quotation, the target-language
        // pass first for anything the model wrote itself.
        const sources = want.kind === 'said'
          ? [await originalWords(track), ws]
          : [ws, await originalWords(track)]

        const windows: { start: number; end: number }[] = []
        for (const form of forms) {
          for (const src of sources) {
            if (!src.length) continue
            windows.push(...rank(findWindows(src, form), form))
            if (windows.length) break
          }
          if (windows.length) break
        }

        for (const w of windows.slice(0, MAX_TRIES)) {
          const start = Math.max(0, w.start - PAD_BEFORE)
          const seconds = Math.min(MAX_CLIP_SEC, (w.end - w.start) + PAD_BEFORE + PAD_AFTER)
          const clip = await cutClip(file, start, seconds)
          if (!clip.length) continue
          const heard = await heardIn(clip, lang, want.phrase)
          lastHeard = heard
          if (!saysIt(heard, want.phrase)) continue

          const up = await admin.storage.from(RECORDING_BUCKET)
            .upload(clipPath(opts.recordingId, want.kind, want.key, voice), clip, {
              contentType: 'audio/webm', upsert: true,
            })
          if (up.error) { missed.push({ ...want, why: up.error.message }); placed = true; break }
          made.push({ kind: want.kind, key: want.key, phrase: want.phrase, voice, start: w.start, heard: heard.trim() })
          placed = true
          break
        }
        if (placed) break
      }

      if (!placed) {
        missed.push({ ...want, why: lastHeard ? `heard "${lastHeard.trim().slice(0, 48)}"` : 'never said on either track' })
      }
    }
  } finally {
    for (const f of Object.values(local)) if (f) await unlink(f).catch(() => {})
  }

  return { made, missed }
}

/**
 * What of this lesson can be heard, so a page knows before it renders.
 *
 * One listing for the whole recording: a play button that appears and then
 * turns out to have nothing behind it is worse than no play button.
 */
export async function clipsForRecording(admin: any, recordingId: string): Promise<ClipIndex> {
  const { data } = await admin.storage.from(RECORDING_BUCKET).list(`${recordingId}/clips`, { limit: 500 })
  const index: ClipIndex = {}
  for (const f of ((data ?? []) as { name: string }[])) {
    const m = /^(vocab|said|fixed)-(.+)--(teacher|student)\.webm$/.exec(f.name)
    if (!m) continue
    index[clipKey(m[1] as ClipKind, m[2])] = m[3] as Voice
  }
  return index
}

export type Heard = {
  vocab: Record<string, { key: string; voice: Voice }>
  said: Record<string, Voice>
  fixed: Record<string, Voice>
}

/**
 * What a lesson page can play, ready to hand to the renderer.
 *
 * The clips are filed under the vocabulary ROW's id; the page renders the
 * recap's own vocabulary array, which has words and no ids. So the join
 * happens here, once, on the word — and the page never has to know that the
 * two lists are different objects.
 *
 * Returns undefined when there is nothing to hear, which is the common case:
 * a lesson recorded before this existed, or one whose audio has passed the
 * 30-day purge. The page then renders exactly as it always did.
 */
export async function heardForLesson(
  admin: any,
  lesson: { id: string; source_event_id?: string | null },
): Promise<Heard | undefined> {
  const eventId = String(lesson.source_event_id ?? '')
  if (!eventId.startsWith('ext:')) return undefined

  const index = await clipsForRecording(admin, eventId.slice(4))
  if (!Object.keys(index).length) return undefined

  const heard: Heard = { vocab: {}, said: {}, fixed: {} }

  const { data: rows } = await admin
    .from('vocabulary_items').select('id, word').eq('lesson_id', lesson.id)
  for (const row of ((rows ?? []) as { id: string; word: string }[])) {
    const voice = index[clipKey('vocab', row.id)]
    if (voice) heard.vocab[row.word] = { key: row.id, voice }
  }

  for (const [k, voice] of Object.entries(index)) {
    const [kind, key] = k.split(':')
    if (kind === 'said') heard.said[key] = voice
    if (kind === 'fixed') heard.fixed[key] = voice
  }

  const any = Object.keys(heard.vocab).length + Object.keys(heard.said).length + Object.keys(heard.fixed).length
  return any ? heard : undefined
}
