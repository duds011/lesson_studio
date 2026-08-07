/**
 * Where extension recordings live. Kept out of the route files because a
 * Next.js route module may only export handlers and its config.
 */
export const RECORDING_BUCKET = 'lesson-recordings'

export const trackPath = (recordingId: string, track: string) => `${recordingId}/${track}.webm`

/**
 * How long uploaded lesson audio is kept before the daily purge removes it.
 *
 * Stated as a promise in the privacy policy and in the extension's first-run
 * disclosure, so it is not a number to change casually — both say 30 days.
 * Long enough that /api/recap/build can still rebuild a recap from the
 * original audio, short enough to be a real limit rather than "indefinitely".
 */
export const RETENTION_DAYS = 30
