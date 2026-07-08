import { NextResponse } from 'next/server'
import { getBusyIntervals, DEFAULT_TEACHER_ID } from '@/lib/google'
import { getBookingConfig, buildAvailability, todayTokyo, addDaysTokyo } from '@/lib/booking'

export const dynamic = 'force-dynamic'

// Public: returns available days + slot start times (ISO UTC) for the student page.
export async function GET() {
  try {
    const cfg = await getBookingConfig(DEFAULT_TEACHER_ID)
    const now = Date.now()
    const timeMin = new Date(now).toISOString()
    const timeMax = new Date(`${addDaysTokyo(todayTokyo(), cfg.daysAhead + 1)}T00:00:00${cfg.offset}`).toISOString()

    const busy = await getBusyIntervals(DEFAULT_TEACHER_ID, timeMin, timeMax)
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
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
