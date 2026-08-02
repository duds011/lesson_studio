import { NextRequest, NextResponse } from 'next/server'
import { createBookingEvent, getBusyIntervals } from '@/lib/google'
import { getBookingConfig } from '@/lib/booking'
import { getSettings } from '@/lib/settings'
import { createZoomMeeting, isZoomConfigured } from '@/lib/zoom'
import { resolveBookingTeacherId } from '@/lib/current-teacher'
import { runAsTeacher } from '@/lib/teacher-scope'

export const dynamic = 'force-dynamic'

// Public: student submits a booking. Validates the slot is still free, then
// creates the event (with Meet link) on the teacher's calendar.
//
// No session, so the teacher is resolved the same way as /api/book/slots and
// the whole booking runs inside their scope.
export async function POST(req: NextRequest) {
  try {
    const { start, name, email, teacherId: bodyTeacherId } = await req.json()
    if (!start || !name || !email) {
      return NextResponse.json({ ok: false, error: 'Missing name, email, or time.' }, { status: 400 })
    }

    const teacherId = await resolveBookingTeacherId(bodyTeacherId ?? req.nextUrl.searchParams.get('t'))
    if (!teacherId) {
      return NextResponse.json(
        { ok: false, error: 'This booking link needs a teacher. Ask your teacher for their personal booking link.' },
        { status: 400 },
      )
    }
    return await runAsTeacher(teacherId, async () => {
    const cfg = await getBookingConfig()
    const startMs = new Date(start).getTime()
    const endMs = startMs + cfg.durationMin * 60_000
    if (isNaN(startMs)) return NextResponse.json({ ok: false, error: 'Invalid time.' }, { status: 400 })

    // Re-check it hasn't been taken since the page loaded (with buffers).
    const bufBefore = cfg.bufferBeforeMin * 60_000
    const bufAfter = cfg.bufferAfterMin * 60_000
    const busy = await getBusyIntervals(
      new Date(startMs - 3 * 3600_000).toISOString(),
      new Date(endMs + 3 * 3600_000).toISOString()
    )
    const taken = busy.some((b) => startMs - bufBefore < b.end && endMs + bufAfter > b.start)
    if (taken) {
      return NextResponse.json({ ok: false, error: 'That slot was just taken — please pick another.' }, { status: 409 })
    }

    // Teacher's chosen meeting platform.
    const { platform } = await getSettings()

    let zoomLink: string | undefined
    if (platform === 'zoom') {
      if (!isZoomConfigured()) {
        return NextResponse.json({ ok: false, error: 'Zoom isn’t connected yet. Add Zoom credentials in settings.' }, { status: 400 })
      }
      try {
        const z = await createZoomMeeting({
          topic: `${cfg.title} — ${name}`,
          startISO: new Date(startMs).toISOString(),
          durationMin: cfg.durationMin,
          timezone: cfg.tz,
        })
        zoomLink = z.joinUrl
      } catch (e: any) {
        return NextResponse.json({ ok: false, error: `Zoom meeting could not be created: ${e?.message ?? 'failed'}` }, { status: 502 })
      }
    }

    const result = await createBookingEvent({
      summary: `${cfg.title} — ${name}`,
      description: zoomLink
        ? `Booked via Lesson Studio.\nStudent: ${name} (${email})\nZoom: ${zoomLink}`
        : `Booked via Lesson Studio.\nStudent: ${name} (${email})`,
      startUTC: new Date(startMs).toISOString(),
      endUTC: new Date(endMs).toISOString(),
      timeZone: cfg.tz,
      attendeeEmail: email,
      attendeeName: name,
      addMeet: platform === 'google_meet',
      location: zoomLink,
    })

    return NextResponse.json({ ok: true, platform, ...result })
    })
  } catch (e: any) {
    if (e?.message === 'SCOPE') {
      return NextResponse.json(
        { ok: false, error: 'Your teacher needs to reconnect their calendar to enable bookings.' },
        { status: 403 }
      )
    }
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
