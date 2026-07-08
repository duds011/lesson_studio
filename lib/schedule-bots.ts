import { listLessonsInRange } from '@/lib/google'
import { createBot } from '@/lib/recall'
import { getBots, saveBot } from '@/lib/store'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapEventToStudent } from '@/lib/lesson-link'

export type ScheduleResult =
  | { ok: true; scheduled: number; scheduledTitles: string[]; skipped: { title: string; reason: string }[] }
  | { ok: false; error: string }

/**
 * Scan the calendar for upcoming lessons and ensure each one that maps to a
 * real student has a recorder bot scheduled. Idempotent — lessons that already
 * have a bot (or no meeting link, or no student) are skipped. Catches ALL
 * upcoming lessons whether newly booked or already on the calendar, so it can
 * be run on any trigger (daily cron, app load, external pinger).
 */
export async function scheduleUpcomingBots(windowHours = 30): Promise<ScheduleResult> {
  const now = Date.now()
  const from = new Date(now).toISOString()
  const to = new Date(now + windowHours * 3600_000).toISOString()

  let lessons
  try {
    lessons = await listLessonsInRange(from, to)
  } catch (e: any) {
    return { ok: false, error: e?.message === 'SCOPE' ? 'Calendar needs reconnect' : (e?.message ?? 'calendar failed') }
  }

  const bots = await getBots()
  const admin = createAdminClient()
  const scheduled: string[] = []
  const skipped: { title: string; reason: string }[] = []

  for (const l of lessons) {
    if (!l.meetingUrl) { skipped.push({ title: l.title, reason: 'no meeting link' }); continue }
    const existing = bots[l.id]
    if (existing?.studentName) continue // already scheduled AND enriched
    if (!existing && new Date(l.start).getTime() <= now) continue // past, nothing to do

    const linked = await mapEventToStudent(admin, l.id, l.attendees ?? [])
    if (!linked) { if (!existing) skipped.push({ title: l.title, reason: 'not a student' }); continue }
    const meta = { studentName: linked.fullName, lessonTitle: l.title, lessonDate: l.start, attendees: l.attendees ?? [] }

    // Existing bot missing metadata → backfill it (e.g. scheduled before this).
    if (existing) { await saveBot({ ...existing, ...meta }); continue }

    try {
      // ~1 min before start, but never in the past (short-notice lessons).
      const joinAt = new Date(Math.max(now + 15_000, new Date(l.start).getTime() - 60_000)).toISOString()
      const bot = await createBot(l.meetingUrl, 'Lesson Recorder', joinAt)
      await saveBot({ eventId: l.id, botId: bot.id, status: bot.status, meetingUrl: l.meetingUrl, createdAt: Date.now(), ...meta })
      scheduled.push(l.title)
    } catch (e: any) {
      skipped.push({ title: l.title, reason: `bot failed: ${e?.message ?? 'error'}` })
    }
  }

  return { ok: true, scheduled: scheduled.length, scheduledTitles: scheduled, skipped }
}
