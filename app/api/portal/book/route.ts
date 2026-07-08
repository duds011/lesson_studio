import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStudentCredits } from '@/lib/credits'
import { createBookingEvent, getBusyIntervals } from '@/lib/google'
import { getBookingConfig } from '@/lib/booking'
import { getSettings } from '@/lib/settings'
import { createZoomMeeting, isZoomConfigured } from '@/lib/zoom'

export const dynamic = 'force-dynamic'

// Authenticated student books a lesson from their portal. Creates the calendar
// event (like /api/book) but ties it to the student via a `bookings` row.
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })

    const admin = createAdminClient()
    const { data: student } = await admin.from('students').select('id, teacher_id, full_name, email').eq('profile_id', user.id).single()
    if (!student) return NextResponse.json({ ok: false, error: 'No student profile linked to your account.' }, { status: 403 })
    const teacherId = student.teacher_id

    const cfg = await getBookingConfig(teacherId)
    const { start } = await req.json()
    const startMs = new Date(start).getTime()
    if (isNaN(startMs)) return NextResponse.json({ ok: false, error: 'Invalid time.' }, { status: 400 })
    const endMs = startMs + cfg.durationMin * 60_000

    // Re-check the slot is still free (with buffers).
    const bufBefore = cfg.bufferBeforeMin * 60_000
    const bufAfter = cfg.bufferAfterMin * 60_000
    const busy = await getBusyIntervals(teacherId, new Date(startMs - 3 * 3600_000).toISOString(), new Date(endMs + 3 * 3600_000).toISOString())
    if (busy.some((b) => startMs - bufBefore < b.end && endMs + bufAfter > b.start)) {
      return NextResponse.json({ ok: false, error: 'That slot was just taken — please pick another.' }, { status: 409 })
    }

    const { platform } = await getSettings(teacherId)
    let zoomLink: string | undefined
    if (platform === 'zoom') {
      if (!isZoomConfigured()) return NextResponse.json({ ok: false, error: 'Zoom isn’t connected yet.' }, { status: 400 })
      const z = await createZoomMeeting(teacherId, { topic: `${cfg.title} — ${student.full_name}`, startISO: new Date(startMs).toISOString(), durationMin: cfg.durationMin, timezone: cfg.tz })
      zoomLink = z.joinUrl
    }

    const result = await createBookingEvent(teacherId, {
      summary: `${cfg.title} — ${student.full_name}`,
      description: `Booked via student portal.\nStudent: ${student.full_name} (${student.email})${zoomLink ? `\nZoom: ${zoomLink}` : ''}`,
      startUTC: new Date(startMs).toISOString(),
      endUTC: new Date(endMs).toISOString(),
      timeZone: cfg.tz,
      attendeeEmail: student.email,
      attendeeName: student.full_name,
      addMeet: platform === 'google_meet',
      location: zoomLink,
    })

    await admin.from('bookings').insert({
      student_id: student.id,
      teacher_id: student.teacher_id,
      start_utc: new Date(startMs).toISOString(),
      end_utc: new Date(endMs).toISOString(),
      google_event_id: result.eventId,
      meeting_url: result.meetUrl ?? zoomLink ?? null,
      status: 'booked',
    })

    const credits = await getStudentCredits(admin, student.id)
    return NextResponse.json({ ok: true, platform, meetUrl: result.meetUrl, remaining: credits.remaining, warnOutOfCredits: credits.remaining <= 0 })
  } catch (e: any) {
    if (e?.message === 'SCOPE') return NextResponse.json({ ok: false, error: 'Your teacher needs to reconnect their calendar to enable bookings.' }, { status: 403 })
    return NextResponse.json({ ok: false, error: e?.message ?? 'Booking failed' }, { status: 500 })
  }
}
