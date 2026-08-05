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

export const CALENDAR_MODE_META: Record<CalendarMode, { label: string; hint: string }> = {
  google: {
    label: 'Yes — they’re on my Google Calendar',
    hint: 'We read your lessons, take bookings, and send the recorder',
  },
  none: {
    label: 'No — I schedule somewhere else',
    hint: 'Lessons arrive as recordings; nothing calendar-shaped is shown',
  },
}
