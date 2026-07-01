/**
 * Dead-simple JSON file store. Fine for a single-teacher standalone tool.
 * When this grows to multiple teachers, swap this for Supabase/Postgres.
 */
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), '.data')
const TOKEN_FILE = path.join(DATA_DIR, 'google-token.json')
const BOTS_FILE = path.join(DATA_DIR, 'bots.json')
const RECAPS_FILE = path.join(DATA_DIR, 'recaps.json')
const ZOOM_TOKEN_FILE = path.join(DATA_DIR, 'zoom-token.json')

export type GoogleToken = {
  email: string
  access_token: string
  refresh_token: string
  expiry_date: number // epoch ms
  calendarId?: string // which calendar holds the lessons (default: primary)
  calendarName?: string
}

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true })
}

export async function saveToken(token: GoogleToken): Promise<void> {
  await ensureDir()
  await fs.writeFile(TOKEN_FILE, JSON.stringify(token, null, 2), 'utf-8')
}

export async function getToken(): Promise<GoogleToken | null> {
  try {
    const raw = await fs.readFile(TOKEN_FILE, 'utf-8')
    return JSON.parse(raw) as GoogleToken
  } catch {
    return null
  }
}

export async function setSelectedCalendar(calendarId: string, calendarName: string): Promise<void> {
  const token = await getToken()
  if (!token) return
  await saveToken({ ...token, calendarId, calendarName })
}

export async function clearToken(): Promise<void> {
  try {
    await fs.unlink(TOKEN_FILE)
  } catch {
    /* already gone */
  }
}

// ── Zoom OAuth token (refresh token rotates on every use — always re-save) ──
export type ZoomToken = {
  email: string
  access_token: string
  refresh_token: string
  expiry_date: number
}

export async function getZoomToken(): Promise<ZoomToken | null> {
  try {
    return JSON.parse(await fs.readFile(ZOOM_TOKEN_FILE, 'utf-8')) as ZoomToken
  } catch {
    return null
  }
}

export async function saveZoomToken(token: ZoomToken): Promise<void> {
  await ensureDir()
  await fs.writeFile(ZOOM_TOKEN_FILE, JSON.stringify(token, null, 2), 'utf-8')
}

export async function clearZoomToken(): Promise<void> {
  try {
    await fs.unlink(ZOOM_TOKEN_FILE)
  } catch {
    /* already gone */
  }
}

// ── Bot tracking: which Recall bot is attached to which calendar event ──
export type BotRec = { eventId: string; botId: string; status: string; meetingUrl: string; createdAt: number }

export async function getBots(): Promise<Record<string, BotRec>> {
  try {
    return JSON.parse(await fs.readFile(BOTS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

export async function saveBot(rec: BotRec): Promise<void> {
  await ensureDir()
  const all = await getBots()
  all[rec.eventId] = rec
  await fs.writeFile(BOTS_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export async function updateBotStatus(eventId: string, status: string): Promise<void> {
  const all = await getBots()
  if (all[eventId]) {
    all[eventId].status = status
    await fs.writeFile(BOTS_FILE, JSON.stringify(all, null, 2), 'utf-8')
  }
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
}

export async function getRecaps(): Promise<Record<string, RecapRec>> {
  try {
    return JSON.parse(await fs.readFile(RECAPS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

export async function saveRecap(rec: RecapRec): Promise<void> {
  await ensureDir()
  const all = await getRecaps()
  all[rec.eventId] = rec
  await fs.writeFile(RECAPS_FILE, JSON.stringify(all, null, 2), 'utf-8')
}

export async function setRecapStatus(eventId: string, status: 'draft' | 'published'): Promise<void> {
  const all = await getRecaps()
  if (all[eventId]) {
    all[eventId].status = status
    await fs.writeFile(RECAPS_FILE, JSON.stringify(all, null, 2), 'utf-8')
  }
}
