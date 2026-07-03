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

export type TranscriptResult = {
  lines: string[] // "Speaker: text"
  plain: string // joined transcript for the LLM
  talk: { name: string; isHost: boolean; seconds: number }[]
  studentTalkPct: number | null
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

  for (const seg of segments) {
    const name = seg.participant?.name || 'Unknown'
    hostByName[name] = !!seg.participant?.is_host
    const words = seg.words || []
    if (words.length) {
      lines.push(`${name}: ${words.map((w: any) => w.text).join(' ')}`)
      const first = words[0]?.start_timestamp?.relative ?? 0
      const last = words[words.length - 1]?.end_timestamp?.relative ?? first
      secByName[name] = (secByName[name] ?? 0) + Math.max(0, last - first)
    }
  }

  const talk = Object.keys(secByName).map((name) => ({
    name,
    isHost: hostByName[name],
    seconds: Math.round(secByName[name]),
  }))
  const studentSec = talk.filter((t) => !t.isHost).reduce((a, b) => a + b.seconds, 0)
  const totalSec = talk.reduce((a, b) => a + b.seconds, 0)
  const studentTalkPct = totalSec > 0 ? Math.round((studentSec / totalSec) * 100) : null

  return { lines, plain: lines.join('\n'), talk, studentTalkPct }
}

/** Map Recall status codes → friendly label + state for the UI. */
export function friendlyStatus(code: string): { label: string; state: 'idle' | 'joining' | 'recording' | 'done' | 'error' } {
  switch (code) {
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
    default: return { label: code, state: 'idle' }
  }
}
