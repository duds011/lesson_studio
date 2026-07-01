/**
 * Zoom user OAuth — the teacher clicks "Connect Zoom" and authorizes once.
 * Zoom ROTATES the refresh token on every refresh, so we always persist the new one.
 */
import { getZoomToken, saveZoomToken, type ZoomToken } from './store'

function env(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env var: ${key}`)
  return v
}

export function isZoomConfigured(): boolean {
  return Boolean(process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET)
}

function basicAuth(): string {
  return Buffer.from(`${env('ZOOM_CLIENT_ID')}:${env('ZOOM_CLIENT_SECRET')}`).toString('base64')
}

/** Step 1 — where we send the teacher to grant Zoom access. */
export function buildZoomAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env('ZOOM_CLIENT_ID'),
    redirect_uri: env('ZOOM_REDIRECT_URI'),
    state,
  })
  return `https://zoom.us/oauth/authorize?${params.toString()}`
}

async function fetchZoomEmail(accessToken: string): Promise<string> {
  try {
    const res = await fetch('https://api.zoom.us/v2/users/me', { headers: { Authorization: `Bearer ${accessToken}` } })
    const d = await res.json()
    return d.email ?? 'connected account'
  } catch {
    return 'connected account'
  }
}

/** Step 2 — exchange the auth code for tokens and store them. */
export async function exchangeZoomCode(code: string): Promise<ZoomToken> {
  const res = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basicAuth()}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: env('ZOOM_REDIRECT_URI') }),
  })
  if (!res.ok) throw new Error(`Zoom token exchange failed: ${await res.text()}`)
  const data = await res.json()
  const email = await fetchZoomEmail(data.access_token)
  const token: ZoomToken = {
    email,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  }
  await saveZoomToken(token)
  return token
}

async function refreshZoomToken(token: ZoomToken): Promise<ZoomToken> {
  const res = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: { Authorization: `Basic ${basicAuth()}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: token.refresh_token }),
  })
  if (!res.ok) throw new Error(`ZOOM_REFRESH_FAILED`)
  const data = await res.json()
  const refreshed: ZoomToken = {
    ...token,
    access_token: data.access_token,
    refresh_token: data.refresh_token, // rotated — must persist
    expiry_date: Date.now() + data.expires_in * 1000,
  }
  await saveZoomToken(refreshed)
  return refreshed
}

async function getValidZoomToken(): Promise<ZoomToken | null> {
  const token = await getZoomToken()
  if (!token) return null
  if (Date.now() < token.expiry_date - 60_000) return token
  return refreshZoomToken(token)
}

/** Connection state for the UI. */
export async function zoomConnection(): Promise<{ connected: boolean; email?: string }> {
  const token = await getZoomToken()
  if (!token) return { connected: false }
  return { connected: true, email: token.email }
}

/** Create a scheduled Zoom meeting as the connected teacher; returns join URL. */
export async function createZoomMeeting(opts: {
  topic: string
  startISO: string
  durationMin: number
  timezone: string
}): Promise<{ joinUrl: string; meetingId: string }> {
  const token = await getValidZoomToken()
  if (!token) throw new Error('ZOOM_NOT_CONNECTED')
  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: opts.topic,
      type: 2,
      start_time: opts.startISO,
      duration: opts.durationMin,
      timezone: opts.timezone,
      settings: { join_before_host: true, waiting_room: false },
    }),
  })
  if (!res.ok) throw new Error(`Zoom create meeting failed (${res.status}): ${await res.text()}`)
  const m = await res.json()
  return { joinUrl: m.join_url, meetingId: String(m.id) }
}
