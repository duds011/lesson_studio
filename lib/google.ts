/**
 * Google OAuth + Calendar helpers using plain fetch (no SDK dependency).
 * Flow: auth URL -> user consents -> we exchange code -> store refresh token.
 * On each calendar read we refresh the access token if it's expired.
 */
import { getToken, saveToken, type GoogleToken } from './store'

const SCOPES = [
  // Full calendar access: list calendars, read events (free/busy),
  // and CREATE booking events with Google Meet links.
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid',
]

function env(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env var: ${key}`)
  return v
}

export function isConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

/** Step 1 — where we send the teacher to grant permission. */
export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env('GOOGLE_CLIENT_ID'),
    redirect_uri: env('GOOGLE_REDIRECT_URI'),
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline', // gives us a refresh_token
    prompt: 'consent', // force refresh_token every time during testing
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/** Step 2 — swap the ?code=... for tokens and persist them. */
export async function exchangeCode(code: string): Promise<GoogleToken> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env('GOOGLE_CLIENT_ID'),
      client_secret: env('GOOGLE_CLIENT_SECRET'),
      redirect_uri: env('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  const data = await res.json()

  const email = await fetchEmail(data.access_token)
  const token: GoogleToken = {
    email,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  }
  await saveToken(token)
  return token
}

async function fetchEmail(accessToken: string): Promise<string> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const data = await res.json()
    return data.email ?? 'connected account'
  } catch {
    return 'connected account'
  }
}

async function refreshAccessToken(token: GoogleToken): Promise<GoogleToken> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env('GOOGLE_CLIENT_ID'),
      client_secret: env('GOOGLE_CLIENT_SECRET'),
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`)
  const data = await res.json()
  const refreshed: GoogleToken = {
    ...token,
    access_token: data.access_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  }
  await saveToken(refreshed)
  return refreshed
}

/** Returns a valid access token, refreshing if the stored one expired. */
async function getValidAccessToken(): Promise<GoogleToken | null> {
  const token = await getToken()
  if (!token) return null
  if (Date.now() < token.expiry_date - 60_000) return token // still good
  return refreshAccessToken(token)
}

/** Authenticated Google fetch. Bypasses Next's fetch cache (a cached 401 would
 *  defeat the retry) and force-refreshes + retries once when Google rejects
 *  the stored access token — even if its expiry claims it's still valid. */
async function gfetch(url: string, init: RequestInit = {}): Promise<Response> {
  let token = await getValidAccessToken()
  if (!token) throw new Error('Not connected')
  const withAuth = (t: string): RequestInit => ({
    ...init,
    cache: 'no-store',
    headers: { ...(init.headers || {}), Authorization: `Bearer ${t}` },
  })
  let res = await fetch(url, withAuth(token.access_token))
  if (res.status === 401) {
    console.warn('[google] stored access token rejected — refreshing and retrying')
    token = await refreshAccessToken(token)
    res = await fetch(url, withAuth(token.access_token))
    if (res.status === 401) console.error('[google] retry after refresh still 401')
  }
  return res
}

export type Lesson = {
  id: string
  title: string
  start: string // ISO
  end: string // ISO
  tz: string // IANA timezone for display, e.g. "Asia/Tokyo"
  attendees: string[]
  platform: 'meet' | 'zoom' | 'other'
  meetingUrl: string | null
}

/** Pull the meeting link out of an event from any of the usual spots. */
function extractMeeting(ev: any): { platform: Lesson['platform']; url: string | null } {
  // 1. Native Google Meet
  if (ev.hangoutLink) return { platform: 'meet', url: ev.hangoutLink }
  // 2. conferenceData entry points
  const entry = ev.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')
  if (entry?.uri) {
    const u = entry.uri as string
    if (u.includes('zoom.us')) return { platform: 'zoom', url: u }
    if (u.includes('meet.google.com')) return { platform: 'meet', url: u }
    return { platform: 'other', url: u }
  }
  // 3. Scan location + description for a URL
  const haystack = `${ev.location ?? ''} ${ev.description ?? ''}`
  const zoom = haystack.match(/https?:\/\/[^\s]*zoom\.us\/[^\s"<]+/i)
  if (zoom) return { platform: 'zoom', url: zoom[0] }
  const meet = haystack.match(/https?:\/\/meet\.google\.com\/[^\s"<]+/i)
  if (meet) return { platform: 'meet', url: meet[0] }
  return { platform: 'other', url: null }
}

export type CalendarInfo = { id: string; name: string; primary: boolean }

/** List all of the teacher's calendars (needs calendar.readonly scope). */
export async function listCalendars(): Promise<CalendarInfo[]> {
  const token = await getValidAccessToken()
  if (!token) return []
  const res = await gfetch('https://www.googleapis.com/calendar/v3/users/me/calendarList')
  if (res.status === 403) throw new Error('SCOPE') // old token without calendar.readonly
  if (!res.ok) throw new Error(`Calendar list failed: ${await res.text()}`)
  const data = await res.json()
  return (data.items ?? []).map((c: any): CalendarInfo => ({
    id: c.id,
    name: c.summaryOverride || c.summary || c.id,
    primary: !!c.primary,
  }))
}

/** List upcoming calendar events as lessons, from the teacher's chosen calendar. */
export async function listUpcomingLessons(maxResults = 20): Promise<Lesson[]> {
  const token = await getValidAccessToken()
  if (!token) return []

  const calendarId = token.calendarId || 'primary'

  // Query from 24h ago (to be safe across timezones), then filter to
  // "today onwards" precisely in each event's own timezone below.
  const params = new URLSearchParams({
    timeMin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: String(maxResults),
    conferenceDataVersion: '1',
  })
  const res = await gfetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
  )
  if (!res.ok) throw new Error(`Calendar fetch failed: ${await res.text()}`)
  const data = await res.json()
  const calendarTz: string = data.timeZone || 'UTC' // teacher's calendar timezone

  // "Today" as a YYYY-MM-DD string in the calendar's timezone.
  const localDay = (iso: string | number | Date, tz: string) =>
    new Date(iso).toLocaleDateString('en-CA', { timeZone: tz })
  const todayLocal = localDay(Date.now(), calendarTz)

  return (data.items ?? [])
    .filter((ev: any) => ev.start?.dateTime) // skip all-day events
    .filter((ev: any) => localDay(ev.start.dateTime, ev.start.timeZone || calendarTz) >= todayLocal)
    .map((ev: any): Lesson => {
      const { platform, url } = extractMeeting(ev)
      return {
        id: ev.id,
        title: ev.summary ?? '(no title)',
        start: ev.start.dateTime,
        end: ev.end?.dateTime ?? ev.start.dateTime,
        tz: ev.start.timeZone || calendarTz,
        attendees: (ev.attendees ?? []).map((a: any) => a.email).filter(Boolean),
        platform,
        meetingUrl: url,
      }
    })
}

/** Which calendar bookings are written to / conflicts checked against. */
export async function getBookingCalendarId(): Promise<string> {
  const token = await getToken()
  return token?.calendarId || 'primary'
}

/** Busy intervals (epoch ms) from the booking calendar, for conflict checks. */
export async function getBusyIntervals(
  timeMinISO: string,
  timeMaxISO: string
): Promise<{ start: number; end: number }[]> {
  const token = await getValidAccessToken()
  if (!token) return []
  const calendarId = token.calendarId || 'primary'
  const params = new URLSearchParams({
    timeMin: timeMinISO,
    timeMax: timeMaxISO,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
  })
  const res = await gfetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`
  )
  if (!res.ok) throw new Error(`Busy fetch failed: ${await res.text()}`)
  const data = await res.json()
  return (data.items ?? [])
    .filter((ev: any) => ev.start?.dateTime && ev.status !== 'cancelled')
    .map((ev: any) => ({
      start: new Date(ev.start.dateTime).getTime(),
      end: new Date(ev.end?.dateTime ?? ev.start.dateTime).getTime(),
    }))
}

export type BookingResult = { eventId: string; htmlLink: string; meetUrl: string | null }

/** Create a booking event on the teacher's calendar, optionally with a Meet link. */
export async function createBookingEvent(opts: {
  summary: string
  description?: string
  startUTC: string // ISO
  endUTC: string // ISO
  timeZone: string
  attendeeEmail: string
  attendeeName: string
  addMeet: boolean
  location?: string // e.g. a Zoom join URL
}): Promise<BookingResult> {
  const token = await getValidAccessToken()
  if (!token) throw new Error('Not connected')
  const calendarId = token.calendarId || 'primary'

  const body: any = {
    summary: opts.summary,
    description: opts.description ?? '',
    start: { dateTime: opts.startUTC, timeZone: opts.timeZone },
    end: { dateTime: opts.endUTC, timeZone: opts.timeZone },
    attendees: [{ email: opts.attendeeEmail, displayName: opts.attendeeName }],
  }
  if (opts.location) body.location = opts.location
  if (opts.addMeet) {
    body.conferenceData = {
      createRequest: {
        requestId: `noa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    }
  }

  const params = new URLSearchParams({ conferenceDataVersion: '1', sendUpdates: 'all' })
  const res = await gfetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  if (res.status === 403) throw new Error('SCOPE') // token lacks write access — needs reconnect
  if (!res.ok) throw new Error(`Create event failed: ${await res.text()}`)
  const ev = await res.json()
  return {
    eventId: ev.id,
    htmlLink: ev.htmlLink,
    meetUrl: ev.hangoutLink ?? ev.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri ?? opts.location ?? null,
  }
}
