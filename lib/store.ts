/**
 * Runtime state store. Backed by Vercel KV in production, local files in dev
 * (see lib/docstore). Holds OAuth tokens, bot tracking, recaps, settings.
 *
 * Every doc is namespaced per teacher (`bots:<teacherId>`), so two teachers
 * never share a calendar connection, a bot queue or a recap draft. The id is
 * resolved from the session; jobs without one wrap in runAsTeacher().
 */
import { readDoc, writeDoc, delDoc } from './docstore'
import { requireTeacherId } from './current-teacher'

/** Namespaced doc name for the teacher in scope. */
async function key(name: string, teacherId?: string): Promise<string> {
  return `${name}:${teacherId ?? (await requireTeacherId())}`
}

export type GoogleToken = {
  email: string
  access_token: string
  refresh_token: string
  expiry_date: number // epoch ms
  calendarId?: string // which calendar holds the lessons (default: primary)
  calendarName?: string
}

export async function saveToken(token: GoogleToken, teacherId?: string): Promise<void> {
  await writeDoc(await key('google-token', teacherId), token)
}

export async function getToken(teacherId?: string): Promise<GoogleToken | null> {
  return readDoc<GoogleToken>(await key('google-token', teacherId))
}

export async function setSelectedCalendar(calendarId: string, calendarName: string): Promise<void> {
  const token = await getToken()
  if (!token) return
  await saveToken({ ...token, calendarId, calendarName })
}

export async function clearToken(teacherId?: string): Promise<void> {
  await delDoc(await key('google-token', teacherId))
}

// ── Zoom OAuth token (refresh token rotates on every use — always re-save) ──
export type ZoomToken = {
  email: string
  access_token: string
  refresh_token: string
  expiry_date: number
}

export async function getZoomToken(teacherId?: string): Promise<ZoomToken | null> {
  return readDoc<ZoomToken>(await key('zoom-token', teacherId))
}

export async function saveZoomToken(token: ZoomToken, teacherId?: string): Promise<void> {
  await writeDoc(await key('zoom-token', teacherId), token)
}

export async function clearZoomToken(teacherId?: string): Promise<void> {
  await delDoc(await key('zoom-token', teacherId))
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

export async function getBots(teacherId?: string): Promise<Record<string, BotRec>> {
  return (await readDoc<Record<string, BotRec>>(await key('bots', teacherId))) ?? {}
}

export async function saveBot(rec: BotRec): Promise<void> {
  const all = await getBots()
  all[rec.eventId] = rec
  await writeDoc(await key('bots'), all)
}

export async function updateBotStatus(eventId: string, status: string): Promise<void> {
  const all = await getBots()
  if (all[eventId]) {
    all[eventId].status = status
    await writeDoc(await key('bots'), all)
  }
}

/** Stop tracking a bot after it has been explicitly cancelled. */
export async function deleteBot(eventId: string): Promise<void> {
  const all = await getBots()
  if (!all[eventId]) return
  delete all[eventId]
  await writeDoc(await key('bots'), all)
}

// ── Recaps: AI-generated draft per calendar event ──
export type RecapRec = {
  eventId: string
  studentName: string
  recap: any // structured Recap from OpenAI
  talk: { name: string; isHost: boolean; seconds: number }[]
  studentTalkPct: number | null
  /**
   * 'processing' is written when a recording is claimed and replaced when the
   * recap lands; 'failed' when the build died. Without them a lesson that is
   * still transcribing is indistinguishable from one that was never sent —
   * which is the state that cost a teacher a lesson.
   */
  status: 'processing' | 'failed' | 'draft' | 'published'
  /** Why it failed, for the teacher to read rather than the log. */
  error?: string
  createdAt: number
  // Lesson linkage for publishing the recap to the student's Supabase record.
  lessonDate?: string
  lessonTitle?: string
  attendees?: string[]
}

export async function getRecaps(teacherId?: string): Promise<Record<string, RecapRec>> {
  return (await readDoc<Record<string, RecapRec>>(await key('recaps', teacherId))) ?? {}
}

export async function getDismissedRecaps(teacherId?: string): Promise<Record<string, number>> {
  return (await readDoc<Record<string, number>>(await key('dismissed-recaps', teacherId))) ?? {}
}

export async function saveRecap(rec: RecapRec): Promise<void> {
  const all = await getRecaps()
  all[rec.eventId] = rec
  await writeDoc(await key('recaps'), all)
}

export async function setRecapStatus(eventId: string, status: 'draft' | 'published'): Promise<void> {
  const all = await getRecaps()
  if (all[eventId]) {
    all[eventId].status = status
    await writeDoc(await key('recaps'), all)
  }
}

export async function deleteRecap(eventId: string): Promise<boolean> {
  const all = await getRecaps()
  if (!all[eventId]) return false
  delete all[eventId]
  await writeDoc(await key('recaps'), all)
  return true
}

export async function dismissRecap(eventId: string): Promise<void> {
  const dismissed = await getDismissedRecaps()
  dismissed[eventId] = Date.now()
  await writeDoc(await key('dismissed-recaps'), dismissed)
}
