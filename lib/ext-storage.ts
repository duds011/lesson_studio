/**
 * Where extension recordings live. Kept out of the route files because a
 * Next.js route module may only export handlers and its config.
 */
export const RECORDING_BUCKET = 'lesson-recordings'

export const trackPath = (recordingId: string, track: string) => `${recordingId}/${track}.webm`
