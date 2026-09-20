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

/**
 * The display names live in the dictionary — `platforms`, indexed to the list
 * above — and not in this file.
 *
 * There used to be a META constant here holding a label and a line of
 * explanation for each: "We create the link on your calendar" under Google
 * Meet, and so on. Two things were wrong with it. A module constant is
 * evaluated once at import, so those strings stayed English on a French page,
 * which is most of how this step ended up half translated. And the
 * explanations answered a question nobody had asked — somebody choosing where
 * they teach does not want to be told what we do about links, and the
 * paragraph above the cards says it anyway. The cards are a list of places,
 * and a list of places needs names.
 */

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
