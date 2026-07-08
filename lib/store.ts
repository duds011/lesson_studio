/**
 * Runtime state store. Backed by Vercel KV in production, local files in dev
 * (see lib/docstore). Holds OAuth tokens, bot tracking, recaps, settings.
 *
 * MULTI-TENANT: every teacher's state is namespaced by their Supabase user id,
 * so teachers never share a calendar connection, bots, or recaps. Callers pass
 * the logged-in teacher's id; the daily cron enumerates teachers via the index.
 */
import { readDoc, writeDoc, delDoc } from './docstore'

const key = (name: string, teacherId: string) => `${name}:${teacherId}`

// ── Teacher index: ids of teachers with a Google connection (for the cron) ──
export async function listTeacherIds(): Promise<string[]> {
  return (await readDoc<string[]>('teacher-index')) ?? []
}
async function addToTeacherIndex(teacherId: string): Promise<void> {
  const ids = await listTeacherIds()
  if (!ids.includes(teacherId)) await writeDoc('teacher-index', [...ids, teacherId])
}
async function removeFromTeacherIndex(teacherId: string): Promise<void> {
  const ids = await listTeacherIds()
  if (ids.includes(teacherId)) await writeDoc('teacher-index', ids.filter((id) => id !== teacherId))
}

export type GoogleToken = {
  email: string
  access_token: string
  refresh_token: string
  expiry_date: number // epoch ms
  calendarId?: string // which calendar holds the lessons (default: primary)
  calendarName?: string
}

export async function saveToken(teacherId: string, token: GoogleToken): Promise<void> {
  await writeDoc(key('google-token', teacherId), token)
  await addToTeacherIndex(teacherId)
}

export async function getToken(teacherId: string): Promise<GoogleToken | null> {
  return readDoc<GoogleToken>(key('google-token', teacherId))
}

export async function setSelectedCalendar(teacherId: string, calendarId: string, calendarName: string): Promise<void> {
  const token = await getToken(teacherId)
  if (!token) return
  await saveToken(teacherId, { ...token, calendarId, calendarName })
}

export async function clearToken(teacherId: string): Promise<void> {
  await delDoc(key('google-token', teacherId))
  await removeFromTeacherIndex(teacherId)
}

// ── Zoom OAuth token (refresh token rotates on every use — always re-save) ──
export type ZoomToken = {
  email: string
  access_token: string
  refresh_token: string
  expiry_date: number
}

export async function getZoomToken(teacherId: string): Promise<ZoomToken | null> {
  return readDoc<ZoomToken>(key('zoom-token', teacherId))
}

export async function saveZoomToken(teacherId: string, token: ZoomToken): Promise<void> {
  await writeDoc(key('zoom-token', teacherId), token)
}

export async function clearZoomToken(teacherId: string): Promise<void> {
  await delDoc(key('zoom-token', teacherId))
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

export async function getBots(teacherId: string): Promise<Record<string, BotRec>> {
  return (await readDoc<Record<string, BotRec>>(key('bots', teacherId))) ?? {}
}

export async function saveBot(teacherId: string, rec: BotRec): Promise<void> {
  const all = await getBots(teacherId)
  all[rec.eventId] = rec
  await writeDoc(key('bots', teacherId), all)
}

export async function updateBotStatus(teacherId: string, eventId: string, status: string): Promise<void> {
  const all = await getBots(teacherId)
  if (all[eventId]) {
    all[eventId].status = status
    await writeDoc(key('bots', teacherId), all)
  }
}

/** Stop tracking a bot after it has been explicitly cancelled. */
export async function deleteBot(teacherId: string, eventId: string): Promise<void> {
  const all = await getBots(teacherId)
  if (!all[eventId]) return
  delete all[eventId]
  await writeDoc(key('bots', teacherId), all)
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

export async function getRecaps(teacherId: string): Promise<Record<string, RecapRec>> {
  return (await readDoc<Record<string, RecapRec>>(key('recaps', teacherId))) ?? {}
}

export async function saveRecap(teacherId: string, rec: RecapRec): Promise<void> {
  const all = await getRecaps(teacherId)
  all[rec.eventId] = rec
  await writeDoc(key('recaps', teacherId), all)
}

export async function setRecapStatus(teacherId: string, eventId: string, status: 'draft' | 'published'): Promise<void> {
  const all = await getRecaps(teacherId)
  if (all[eventId]) {
    all[eventId].status = status
    await writeDoc(key('recaps', teacherId), all)
  }
}
