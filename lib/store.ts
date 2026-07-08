/**
 * Runtime state store. Backed by Vercel KV in production, local files in dev
 * (see lib/docstore). Holds OAuth tokens, bot tracking, recaps, settings.
 */
import { readDoc, writeDoc, delDoc } from './docstore'

export type GoogleToken = {
  email: string
  access_token: string
  refresh_token: string
  expiry_date: number // epoch ms
  calendarId?: string // which calendar holds the lessons (default: primary)
  calendarName?: string
}

export async function saveToken(token: GoogleToken): Promise<void> {
  await writeDoc('google-token', token)
}

export async function getToken(): Promise<GoogleToken | null> {
  return readDoc<GoogleToken>('google-token')
}

export async function setSelectedCalendar(calendarId: string, calendarName: string): Promise<void> {
  const token = await getToken()
  if (!token) return
  await saveToken({ ...token, calendarId, calendarName })
}

export async function clearToken(): Promise<void> {
  await delDoc('google-token')
}

// ── Zoom OAuth token (refresh token rotates on every use — always re-save) ──
export type ZoomToken = {
  email: string
  access_token: string
  refresh_token: string
  expiry_date: number
}

export async function getZoomToken(): Promise<ZoomToken | null> {
  return readDoc<ZoomToken>('zoom-token')
}

export async function saveZoomToken(token: ZoomToken): Promise<void> {
  await writeDoc('zoom-token', token)
}

export async function clearZoomToken(): Promise<void> {
  await delDoc('zoom-token')
}

// ── Bot tracking: which Recall bot is attached to which calendar event ──
// Lesson metadata is stored alongside so a finished recording can be shown
// (student name + date) and turned into a recap without another lookup.
export type BotRec = {
  eventId: string
  botId: string
  status: string
  meetingUrl: string
  createdAt: number
  studentName?: string
  lessonTitle?: string
  lessonDate?: string
  attendees?: string[]
}

export async function getBots(): Promise<Record<string, BotRec>> {
  return (await readDoc<Record<string, BotRec>>('bots')) ?? {}
}

export async function saveBot(rec: BotRec): Promise<void> {
  const all = await getBots()
  all[rec.eventId] = rec
  await writeDoc('bots', all)
}

export async function updateBotStatus(eventId: string, status: string): Promise<void> {
  const all = await getBots()
  if (all[eventId]) {
    all[eventId].status = status
    await writeDoc('bots', all)
  }
}

/** Stop tracking a bot after it has been explicitly cancelled. */
export async function deleteBot(eventId: string): Promise<void> {
  const all = await getBots()
  if (!all[eventId]) return
  delete all[eventId]
  await writeDoc('bots', all)
}

// ── Recaps: AI-generated draft per calendar event ──
export type RecapRec = {
  eventId: string
  studentName: string
  recap: any // structured Recap from OpenAI
  talk: { name: string; isHost: boolean; seconds: number }[]
  studentTalkPct: number | null
  status: 'draft' | 'published'
  createdAt: number
  // Lesson linkage for publishing the recap to the student's Supabase record.
  lessonDate?: string
  lessonTitle?: string
  attendees?: string[]
}

export async function getRecaps(): Promise<Record<string, RecapRec>> {
  return (await readDoc<Record<string, RecapRec>>('recaps')) ?? {}
}

export async function saveRecap(rec: RecapRec): Promise<void> {
  const all = await getRecaps()
  all[rec.eventId] = rec
  await writeDoc('recaps', all)
}

export async function setRecapStatus(eventId: string, status: 'draft' | 'published'): Promise<void> {
  const all = await getRecaps()
  if (all[eventId]) {
    all[eventId].status = status
    await writeDoc('recaps', all)
  }
}
