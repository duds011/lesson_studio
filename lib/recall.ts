/**
 * Recall.ai bot dispatch (raw REST — the MCP is read-only).
 * Sends a recording bot into a meeting and reads its live status.
 */
const REGION = process.env.RECALL_REGION || 'us-east-1'
const BASE = `https://${REGION}.recall.ai`

function authHeader(): string {
  const k = process.env.RECALL_API_KEY
  if (!k) throw new Error('Missing RECALL_API_KEY')
  return `Token ${k}`
}

function latestStatus(bot: any): string {
  const sc = bot.status_changes
  if (Array.isArray(sc) && sc.length) return sc[sc.length - 1].code
  return bot.status?.code || bot.status || 'unknown'
}

export type BotInfo = { id: string; status: string; meetingUrl?: string | null }

/** Send a bot into a live meeting (or scheduled via join_at). */
export async function createBot(meetingUrl: string, botName = 'Lesson Recorder', joinAt?: string): Promise<BotInfo> {
  const body: any = {
    meeting_url: meetingUrl,
    bot_name: botName,
    recording_config: { transcript: { provider: { recallai_streaming: {} } } },
  }
  if (joinAt) body.join_at = joinAt

  const res = await fetch(`${BASE}/api/v1/bot/`, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Recall create bot failed (${res.status}): ${await res.text()}`)
  const b = await res.json()
  return { id: b.id, status: latestStatus(b), meetingUrl: b.meeting_url }
}

export async function getBot(id: string): Promise<BotInfo> {
  const res = await fetch(`${BASE}/api/v1/bot/${id}/`, { headers: { Authorization: authHeader() } })
  if (!res.ok) throw new Error(`Recall get bot failed (${res.status}): ${await res.text()}`)
  const b = await res.json()
  return { id: b.id, status: latestStatus(b), meetingUrl: b.meeting_url }
}

/** Make the bot leave / stop. */
export async function removeBot(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1/bot/${id}/leave_call/`, {
    method: 'POST',
    headers: { Authorization: authHeader() },
  })
  if (!res.ok) throw new Error(`Recall remove bot failed (${res.status}): ${await res.text()}`)
}

// Tier-1 fluency metrics, computed purely from the word-level timestamps that
// Recall already returns — no audio processing, no extra API cost.
export type LessonMetrics = {
  studentWpm: number | null // student words per minute of student speech
  avgResponseSec: number | null // avg thinking time: teacher stops → student starts
  fillerCount: number // hesitation words in student speech (えーと, あの, um…)
  longPauseCount: number // mid-utterance silences ≥ 1.5s in student speech
  studentTurns: number // number of student speaking turns
  avgTurnWords: number | null // avg words per student turn
  longestTurnSec: number | null // longest unbroken student stretch (seconds)
  lessonVocab: number // measured distinct content words across the whole lesson
  studentVocab: number // measured distinct content words the student produced
}

// Grammatical glue + copulas we don't count as "vocabulary".
const NON_VOCAB = new Set(['は', 'を', 'が', 'に', 'の', 'へ', 'と', 'も', 'で', 'や', 'か', 'ね', 'よ', 'わ', 'さ', 'ん', 'な', 'だ', 'です', 'ます', 'the', 'a', 'an', 'is', 'to', 'of', 'and'])
const normToken = (t: string) => t.replace(/[\s、。，．・！？!?;:…「」『』（）()\[\]{}"'’“”~〜ー－—\-.,]/g, '').toLowerCase()
function isVocab(raw: string): string | null {
  const w = normToken(raw)
  if (!w || NON_VOCAB.has(w) || FILLERS.includes(w)) return null
  return w
}

export type TranscriptResult = {
  lines: string[] // "Speaker: text"
  plain: string // joined transcript for the LLM
  talk: { name: string; isHost: boolean; seconds: number }[]
  studentTalkPct: number | null
  metrics: LessonMetrics
}

const FILLERS = ['えーと', 'えー', 'ええと', 'えっと', 'あのー', 'あの', 'そのー', 'んー', 'まあ', 'なんか', 'um', 'uh', 'erm', 'like']
function countFillers(text: string): number {
  const lower = text.toLowerCase()
  let n = 0
  for (const f of FILLERS) {
    const re = /[a-z]/.test(f) ? new RegExp(`\\b${f}\\b`, 'g') : new RegExp(f, 'g')
    n += (lower.match(re) || []).length
  }
  return n
}

/** Fetch + normalize the diarized transcript for a finished bot. */
export async function getTranscript(botId: string): Promise<TranscriptResult> {
  const botRes = await fetch(`${BASE}/api/v1/bot/${botId}/`, { headers: { Authorization: authHeader() } })
  if (!botRes.ok) throw new Error(`Recall get bot failed (${botRes.status})`)
  const bot = await botRes.json()
  const url = bot.recordings?.[0]?.media_shortcuts?.transcript?.data?.download_url
  if (!url) throw new Error('Transcript not ready yet — try again in a moment.')

  const data = await (await fetch(url)).json() // array of { participant, words[] }
  const segments: any[] = Array.isArray(data) ? data : []

  const lines: string[] = []
  const secByName: Record<string, number> = {}
  const hostByName: Record<string, boolean> = {}

  // Structured, time-ordered turns so we can measure pace, pauses and latency.
  type Turn = { name: string; isHost: boolean; text: string; start: number; end: number; words: { t: string; s: number; e: number }[] }
  const turns: Turn[] = []

  for (const seg of segments) {
    const name = seg.participant?.name || 'Unknown'
    hostByName[name] = !!seg.participant?.is_host
    const rawWords = seg.words || []
    if (!rawWords.length) continue
    const words = rawWords.map((w: any) => ({
      t: String(w.text ?? ''),
      s: w.start_timestamp?.relative ?? 0,
      e: w.end_timestamp?.relative ?? (w.start_timestamp?.relative ?? 0),
    }))
    const text = words.map((w: { t: string }) => w.t).join(' ')
    const start = words[0].s
    const end = words[words.length - 1].e
    lines.push(`${name}: ${text}`)
    secByName[name] = (secByName[name] ?? 0) + Math.max(0, end - start)
    turns.push({ name, isHost: hostByName[name], text, start, end, words })
  }

  const talk = Object.keys(secByName).map((name) => ({
    name,
    isHost: hostByName[name],
    seconds: Math.round(secByName[name]),
  }))
  const studentSec = talk.filter((t) => !t.isHost).reduce((a, b) => a + b.seconds, 0)
  const totalSec = talk.reduce((a, b) => a + b.seconds, 0)
  const studentTalkPct = totalSec > 0 ? Math.round((studentSec / totalSec) * 100) : null

  const metrics = computeMetrics(turns.sort((a, b) => a.start - b.start), studentSec)
  return { lines, plain: lines.join('\n'), talk, studentTalkPct, metrics }
}

type MTurn = { isHost: boolean; text: string; start: number; end: number; words: { t: string; s: number; e: number }[] }
function computeMetrics(turns: MTurn[], studentSec: number): LessonMetrics {
  const student = turns.filter((t) => !t.isHost)

  // WPM over student speaking time only.
  const studentWords = student.reduce((a, t) => a + t.words.length, 0)
  const studentWpm = studentSec > 2 ? Math.round((studentWords / studentSec) * 60) : null

  // Response latency: teacher turn immediately followed by a student turn.
  const gaps: number[] = []
  for (let i = 1; i < turns.length; i++) {
    if (turns[i - 1].isHost && !turns[i].isHost) {
      const gap = turns[i].start - turns[i - 1].end
      if (gap >= 0 && gap < 30) gaps.push(gap) // ignore negatives (overlap) and long off-topic breaks
    }
  }
  const avgResponseSec = gaps.length ? Math.round((gaps.reduce((a, b) => a + b, 0) / gaps.length) * 10) / 10 : null

  // Fillers + long mid-utterance pauses in student speech.
  let fillerCount = 0
  let longPauseCount = 0
  let longestTurnSec = 0
  for (const t of student) {
    fillerCount += countFillers(t.text)
    for (let i = 1; i < t.words.length; i++) {
      if (t.words[i].s - t.words[i - 1].e >= 1.5) longPauseCount++
    }
    longestTurnSec = Math.max(longestTurnSec, t.end - t.start)
  }

  const studentTurns = student.length
  const avgTurnWords = studentTurns ? Math.round(studentWords / studentTurns) : null

  // Measured vocabulary: distinct content words actually spoken this lesson.
  const lessonSet = new Set<string>()
  const studentSet = new Set<string>()
  for (const t of turns) {
    for (const w of t.words) {
      const v = isVocab(w.t)
      if (!v) continue
      lessonSet.add(v)
      if (!t.isHost) studentSet.add(v)
    }
  }

  return {
    studentWpm,
    avgResponseSec,
    fillerCount,
    longPauseCount,
    studentTurns,
    avgTurnWords,
    longestTurnSec: studentTurns ? Math.round(longestTurnSec) : null,
    lessonVocab: lessonSet.size,
    studentVocab: studentSet.size,
  }
}

/** Map Recall status codes → friendly label + state for the UI. */
export function friendlyStatus(code: string): { label: string; state: 'idle' | 'joining' | 'recording' | 'done' | 'error' } {
  switch (code) {
    case 'ready': return { label: 'Bot scheduled ✓', state: 'joining' }
    case 'joining_call': return { label: 'Bot joining…', state: 'joining' }
    case 'in_waiting_room': return { label: 'In waiting room', state: 'joining' }
    case 'in_call_not_recording': return { label: 'In call', state: 'joining' }
    case 'recording_permission_allowed':
    case 'in_call_recording': return { label: '🔴 Recording', state: 'recording' }
    case 'call_ended':
    case 'recording_done': return { label: 'Recording done', state: 'done' }
    case 'done':
    case 'analysis_done': return { label: 'Done', state: 'done' }
    case 'fatal':
    case 'analysis_failed': return { label: 'Failed', state: 'error' }
    // A bot record exists but the status is early/unmapped → it's scheduled.
    default: return { label: 'Bot scheduled ✓', state: 'joining' }
  }
}
