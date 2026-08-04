/**
 * Where a teacher actually meets their students.
 *
 * This is a different question from `Platform` in lib/settings, which only
 * decides what link a booking creates. A teacher on Preply or another
 * marketplace meets in someone else's room: there is no link for us to make,
 * often no calendar to read, and lessons arrive from a recording rather than
 * from a calendar event. Knowing which of those two worlds a teacher lives in
 * is what lets the rest of the app stop asking them for a calendar.
 */
import type { Platform } from './settings'

export const TEACHING_PLATFORMS = ['google_meet', 'zoom', 'preply', 'italki', 'other'] as const
export type TeachingPlatform = (typeof TEACHING_PLATFORMS)[number]

export const isTeachingPlatform = (v: unknown): v is TeachingPlatform =>
  TEACHING_PLATFORMS.includes(v as TeachingPlatform)

export const TEACHING_PLATFORM_META: Record<TeachingPlatform, { label: string; hint: string }> = {
  google_meet: { label: 'Google Meet', hint: 'We create the link on your calendar' },
  zoom: { label: 'Zoom', hint: 'We create the room for each booking' },
  preply: { label: 'Preply', hint: 'Lessons happen in Preply’s classroom' },
  italki: { label: 'italki', hint: 'Lessons happen in italki’s classroom' },
  other: { label: 'Another platform', hint: 'Cambly, Verbling, Skype, your own room…' },
}

/** True when the lesson happens somewhere we neither create nor schedule. */
export const isExternalPlatform = (p: TeachingPlatform | null | undefined) =>
  p === 'preply' || p === 'italki' || p === 'other'

/** The link a booking should create for a teacher on this platform. */
export function linkPlatformFor(p: TeachingPlatform): Platform {
  if (p === 'zoom') return 'zoom'
  if (p === 'google_meet') return 'google_meet'
  return 'none'
}

export const resolveTeachingPlatform = (raw: unknown): TeachingPlatform =>
  isTeachingPlatform(raw) ? raw : 'google_meet'
