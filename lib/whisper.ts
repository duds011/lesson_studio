/**
 * Transcribes the browser-extension recorder's tracks.
 *
 * The extension records each speaker on their own track, so there is no
 * diarization to do and no guessing: every word on the mic track is the person
 * holding the mic, every word on the tab track is the other participant. That
 * is strictly better attribution than a bot gets from one mixed stream.
 *
 * Output matches the segment shape lib/recall.ts already normalizes, so talk
 * time and the fluency metrics are computed by exactly the same code.
 */

/** A silence this long inside one speaker's audio starts a new turn. */
const TURN_GAP_SEC = 0.9
/** Whisper rejects anything larger. ~32kbps mono gives roughly 100 minutes. */
const MAX_BYTES = 25 * 1024 * 1024

export type TrackInput = {
  blob: Blob
  /** Display name for this speaker in the transcript. */
  speaker: string
  /** The teacher is the host; talk-time percentages are measured against it. */
  isHost: boolean
}

type Word = { text: string; start: number; end: number }

async function transcribeOne(blob: Blob, language?: string): Promise<Word[]> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('Missing OPENAI_API_KEY')
  if (blob.size === 0) return []
  if (blob.size > MAX_BYTES) {
    throw new Error(`Track is ${(blob.size / 1024 / 1024).toFixed(1)}MB; Whisper accepts up to 25MB.`)
  }

  const form = new FormData()
  form.append('file', blob, 'track.webm')
  form.append('model', 'whisper-1')
  form.append('response_format', 'verbose_json')
  form.append('timestamp_granularities[]', 'word')
  if (language) form.append('language', language)

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  })
  if (!res.ok) throw new Error(`Whisper failed (${res.status}): ${await res.text()}`)

  const json = await res.json()
  const words: any[] = Array.isArray(json.words) ? json.words : []
  return words
    .map((w) => ({ text: String(w.word ?? w.text ?? '').trim(), start: Number(w.start) || 0, end: Number(w.end) || 0 }))
    .filter((w) => w.text)
}

/** Group one speaker's words into turns, breaking on silence. */
function toSegments(words: Word[], speaker: string, isHost: boolean) {
  const segments: any[] = []
  let current: Word[] = []

  const flush = () => {
    if (!current.length) return
    segments.push({
      participant: { name: speaker, is_host: isHost },
      words: current.map((w) => ({
        text: w.text,
        start_timestamp: { relative: w.start },
        end_timestamp: { relative: w.end },
      })),
    })
    current = []
  }

  for (const w of words) {
    if (current.length && w.start - current[current.length - 1].end >= TURN_GAP_SEC) flush()
    current.push(w)
  }
  flush()
  return segments
}

// Latin-1 accents, kana and CJK are kept so French and Japanese survive; the
// `u` flag and \p{L} are avoided because this project compiles to ES5.
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9À-ɏ぀-ヿ一-鿿]/g, '')

/** second → word → the exact times it was spoken at. */
type Buckets = Record<number, Record<string, number[]>>

/** Words bucketed by whole second, so overlap lookups stay O(1) per word. */
function bucketWords(segments: any[]): Buckets {
  const buckets: Buckets = {}
  for (const seg of segments) {
    for (const w of seg.words) {
      const at = w.start_timestamp.relative
      const text = norm(w.text)
      if (!text) continue
      const s = Math.floor(at)
      if (!buckets[s]) buckets[s] = {}
      if (!buckets[s][text]) buckets[s][text] = []
      buckets[s][text].push(at)
    }
  }
  return buckets
}

/**
 * Closest time the other track says `text`, or null.
 *
 * The exact time matters, not the bucket it landed in: echo lag is a couple of
 * hundred milliseconds, so comparing against a whole-second index buried the
 * signal under its own rounding and threw away real speech.
 */
function findEcho(buckets: Buckets, text: string, at: number, window: number): number | null {
  let best: number | null = null
  for (let s = Math.floor(at - window); s <= Math.floor(at + window); s++) {
    const times = buckets[s] && buckets[s][text]
    if (!times) continue
    for (const t of times) {
      if (Math.abs(t - at) > window) continue
      if (best === null || Math.abs(t - at) < Math.abs(best - at)) best = t
    }
  }
  return best
}

/**
 * Removes speaker bleed, so the teacher does not have to wear headphones.
 *
 * On speakers, each side's mic re-captures whatever just came out of them, and
 * both tracks end up carrying both voices. The give-away is that bleed is a
 * *delayed* copy: your mic hears the student only after their audio has played,
 * and their voice reaches our tab track before it reaches our microphone. So
 * when the same words appear on both tracks at nearly the same time, the later
 * one is the echo and the earlier one is the real speaker.
 *
 * That direction test is what makes this safe. Genuine simultaneous speech
 * produces *different* words on the two tracks and is left alone; only a
 * near-duplicate that lags its twin is dropped.
 */
const ECHO_WINDOW_SEC = 1.5
const ECHO_MATCH_RATIO = 0.6

function dropEcho(segments: any[]): any[] {
  const byTrack: Record<string, any[]> = {}
  for (const seg of segments) {
    const name = seg.participant?.name ?? 'Unknown'
    if (!byTrack[name]) byTrack[name] = []
    byTrack[name].push(seg)
  }
  const names = Object.keys(byTrack)
  if (names.length < 2) return segments

  const bucketsFor: Record<string, Buckets> = {}
  for (const name of names) bucketsFor[name] = bucketWords(byTrack[name])

  return segments.filter((seg) => {
    const name = seg.participant?.name ?? 'Unknown'
    const words = seg.words.filter((w: any) => norm(w.text))
    if (words.length === 0) return false

    let matched = 0
    let lagSum = 0
    for (const other of names) {
      if (other === name) continue
      for (const w of words) {
        const at = w.start_timestamp.relative
        const echoAt = findEcho(bucketsFor[other], norm(w.text), at, ECHO_WINDOW_SEC)
        if (echoAt !== null) { matched++; lagSum += at - echoAt }
      }
    }

    if (matched / words.length < ECHO_MATCH_RATIO) return true // genuinely this speaker
    // Duplicated on both tracks: keep it only if this copy came first.
    return lagSum / matched <= 0
  })
}

/**
 * Transcribe every track and interleave them into one time-ordered transcript.
 * Both tracks start at the same instant, so their relative timestamps align.
 */
export async function transcribeTracks(tracks: TrackInput[], language?: string): Promise<any[]> {
  const perTrack = await Promise.all(
    tracks.map(async (t) => toSegments(await transcribeOne(t.blob, language), t.speaker, t.isHost)),
  )
  const all = perTrack
    .flat()
    .sort((a, b) => (a.words[0]?.start_timestamp.relative ?? 0) - (b.words[0]?.start_timestamp.relative ?? 0))
  return dropEcho(all)
}

/** Exported for testing the echo filter without calling Whisper. */
export const __test = { dropEcho, toSegments }
