import { NextRequest, NextResponse } from 'next/server'
import { createBot } from '@/lib/recall'
import { saveBot } from '@/lib/store'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapEventToStudent } from '@/lib/lesson-link'

export const dynamic = 'force-dynamic'

// Dispatch the lesson recorder into a meeting now (or scheduled via join_at).
export async function POST(req: NextRequest) {
  try {
    const { eventId, meetingUrl, botName, joinAt, attendees } = await req.json()
    if (!eventId || !meetingUrl) {
      return NextResponse.json({ ok: false, error: 'Missing eventId or meetingUrl.' }, { status: 400 })
    }
    const bot = await createBot(meetingUrl, botName || 'Lesson Recorder', joinAt)
    await saveBot({
      eventId,
      botId: bot.id,
      status: bot.status,
      meetingUrl,
      createdAt: Date.now(),
    })

    // Recording = lesson is live → open the shared doc for the matched student.
    let studentId: string | null = null
    try {
      const admin = createAdminClient()
      const linked = await mapEventToStudent(admin, eventId, Array.isArray(attendees) ? attendees : [])
      if (linked) {
        studentId = linked.studentId
        await admin.from('lesson_docs').upsert(
          { teacher_id: linked.teacherId, student_id: linked.studentId, active: true, active_event_id: eventId },
          { onConflict: 'student_id' },
        )
      }
    } catch (e) { console.error('live-doc activate failed', e) }

    return NextResponse.json({ ok: true, botId: bot.id, status: bot.status, studentId })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
