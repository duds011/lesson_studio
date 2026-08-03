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

/**
 * Transcribe every track and interleave them into one time-ordered transcript.
 * Both tracks start at the same instant, so their relative timestamps align.
 */
export async function transcribeTracks(tracks: TrackInput[], language?: string): Promise<any[]> {
  const perTrack = await Promise.all(
    tracks.map(async (t) => toSegments(await transcribeOne(t.blob, language), t.speaker, t.isHost)),
  )
  return perTrack
    .flat()
    .sort((a, b) => (a.words[0]?.start_timestamp.relative ?? 0) - (b.words[0]?.start_timestamp.relative ?? 0))
}
