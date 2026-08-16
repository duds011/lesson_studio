/**
 * Turns anything thrown by the calendar code into something a teacher can read.
 *
 * Google answers a dead connection with `{"error":"invalid_grant", ...}`, and
 * that string used to land on the overview verbatim. A teacher who reads it
 * learns only that something is broken — not that her calendar needs
 * reconnecting, which is the one thing she can actually do about it.
 *
 * Pure strings and no imports, so the client calendar grid can use it too.
 */

/** What the teacher can do about it — never why it broke. */
export type CalendarFailure =
  | 'SCOPE' // connected, but the token predates a permission we now need
  | 'RECONNECT' // token expired, revoked, or never there
  | 'RETRY' // Google was unreachable or unhappy; nothing to fix

export const CALENDAR_FAILURE_TEXT: Record<CalendarFailure, string> = {
  SCOPE: 'Your Google connection needs updated permissions.',
  RECONNECT: 'Your Google Calendar connection has expired. Reconnect it to see your lessons again.',
  RETRY: 'Your calendar could not be loaded just now. Refresh the page to try again.',
}

/** Whether this failure is worth offering a Settings link for. */
export const isFixable = (f: CalendarFailure): boolean => f !== 'RETRY'

/**
 * Google's wording for a refresh token it will not honour. `invalid_grant`
 * covers expired, revoked, and consent withdrawn — all the same to a teacher,
 * and all fixed by reconnecting.
 */
const DEAD_CONNECTION = /invalid_grant|expired or revoked|Token refresh failed|Not connected/i

export function calendarFailure(e: unknown): CalendarFailure {
  const msg = e instanceof Error ? e.message : String(e ?? '')
  if (msg === 'SCOPE') return 'SCOPE'
  if (DEAD_CONNECTION.test(msg)) return 'RECONNECT'
  return 'RETRY'
}

/** Narrows a value off the wire back to a code, so a stray string cannot print. */
export function asCalendarFailure(v: unknown): CalendarFailure {
  return v === 'SCOPE' || v === 'RECONNECT' ? v : 'RETRY'
}
