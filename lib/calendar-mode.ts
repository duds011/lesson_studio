/**
 * Does this teacher keep their lessons on a calendar?
 *
 * The app was built on the assumption that every teacher has a Google Calendar
 * we can read — the overview page was a Connect-Google wall until you did. But
 * a teacher whose students all come through a marketplace schedules inside that
 * marketplace, and there is no calendar to connect. Asking the question once,
 * in onboarding, is what lets every calendar-shaped surface step aside for them
 * instead of nagging.
 *
 * Kept separate from `TeachingPlatform` on purpose: a Preply teacher may still
 * want a booking page for their private students, and a Google Meet teacher who
 * schedules by hand may want nothing to do with one.
 */
/**
 * Is connecting a Google Calendar offered at all?
 *
 * Off since 2026-09-21: the OAuth flow is not working, and a Connect button
 * that leads nowhere is worse than no button — a teacher who presses it on
 * their first day concludes the product is broken, which is a fair reading.
 * So the option is still SHOWN, marked as coming, and cannot be chosen.
 *
 * Deliberately not a deletion. Everything on the other side of this switch —
 * the reader, the bookings, the calendar overview — is built and works for the
 * accounts already connected; only the door in is shut. Turn this back to true
 * and it all comes back, in onboarding, in Settings and on the overview.
 */
// Typed, not inferred: as a `false` literal every `if (GOOGLE_CALENDAR_LIVE)`
// in the app narrows to unreachable code and the branches behind it stop being
// type-checked — which is how a switch meant to be flipped back rots.
export const GOOGLE_CALENDAR_LIVE: boolean = false

export const CALENDAR_MODES = ['google', 'none'] as const
export type CalendarMode = (typeof CALENDAR_MODES)[number]

export const isCalendarMode = (v: unknown): v is CalendarMode =>
  CALENDAR_MODES.includes(v as CalendarMode)

/**
 * Old rows have no answer stored. Defaulting to 'google' keeps every teacher
 * who set up before this question existed on the surfaces they already use.
 */
export const resolveCalendarMode = (raw: unknown): CalendarMode =>
  isCalendarMode(raw) ? raw : 'google'

/** True when this teacher has told us not to expect a calendar. */
export const skipsCalendar = (m: CalendarMode | null | undefined) => m === 'none'

/**
 * How the two answers are worded lives in the dictionary — `calendarModes`,
 * indexed to CALENDAR_MODES above — and not here.
 *
 * It was a module constant, which is evaluated once at import, so onboarding
 * and Settings both printed these in English however the rest of the page was
 * written. Same trap as the nav labels and the platform names.
 */
