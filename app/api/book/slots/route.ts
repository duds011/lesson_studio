import { NextRequest, NextResponse } from 'next/server'
import { getBusyIntervals } from '@/lib/google'
import { getBookingConfig, buildAvailability, todayTokyo, addDaysTokyo } from '@/lib/booking'
import { resolveBookingTeacherId } from '@/lib/current-teacher'
import { runAsTeacher } from '@/lib/teacher-scope'

export const dynamic = 'force-dynamic'

// Public: returns available days + slot start times (ISO UTC) for the student page.
// No session here, so the teacher being booked is resolved from ?t=, an env
// override, or a lone teacher in the workspace — and everything below runs in
// that teacher's scope so it reads THEIR calendar and availability.
export async function GET(req: NextRequest) {
  try {
    const teacherId = await resolveBookingTeacherId(req.nextUrl.searchParams.get('t'))
    if (!teacherId) {
      return NextResponse.json(
        { ok: false, error: 'This booking link needs a teacher. Ask your teacher for their personal booking link.' },
        { status: 400 },
      )
    }

    return await runAsTeacher(teacherId, async () => {
      const cfg = await getBookingConfig()
      const now = Date.now()
      const timeMin = new Date(now).toISOString()
      const timeMax = new Date(`${addDaysTokyo(todayTokyo(), cfg.daysAhead + 1)}T00:00:00${cfg.offset}`).toISOString()

      const busy = await getBusyIntervals(timeMin, timeMax)
      const days = buildAvailability(cfg, now, busy).map((d) => ({
        date: d.date,
        weekday: d.weekday,
        slots: d.slots.map((ms) => new Date(ms).toISOString()),
      }))

      return NextResponse.json({
        ok: true,
        tz: cfg.tz,
        title: cfg.title,
        durationMin: cfg.durationMin,
        days,
      })
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
