import { NextRequest, NextResponse } from 'next/server'
import { getRecaps, setRecapStatus } from '@/lib/store'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapEventToStudent } from '@/lib/lesson-link'

export const dynamic = 'force-dynamic'

// Get a stored recap for an event.
export async function GET(req: NextRequest) {
  const eventId = new URL(req.url).searchParams.get('eventId')
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })
  const all = await getRecaps()
  const rec = all[eventId]
  if (!rec) return NextResponse.json({ ok: false, error: 'No recap' }, { status: 404 })
  return NextResponse.json({ ok: true, ...rec })
}

// Publish a recap (teacher approval) → also write it to the student's Supabase
// record so it shows in their portal, including the whiteboard snapshot.
export async function POST(req: NextRequest) {
  const { eventId } = await req.json()
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })

  const all = await getRecaps()
  const rec = all[eventId]
  if (!rec) return NextResponse.json({ ok: false, error: 'No recap to publish' }, { status: 404 })

  await setRecapStatus(eventId, 'published')

  // Bridge the built recap to the student's Supabase record.
  let delivered = false
  try {
    const admin = createAdminClient()
    const linked = await mapEventToStudent(admin, eventId, rec.attendees ?? [])
    if (linked) {
      const recapObj: any = rec.recap || {}
      const lessonDate = rec.lessonDate ? rec.lessonDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
      const title = rec.lessonTitle || 'Lesson'

      const { data: lessonRow, error: le } = await admin
        .from('lessons')
        .upsert(
          { teacher_id: linked.teacherId, student_id: linked.studentId, title, lesson_date: lessonDate, status: 'published', source_event_id: eventId },
          { onConflict: 'source_event_id' },
        )
        .select('id')
        .single()
      if (le) throw le

      const { error: se } = await admin.from('lesson_summaries').upsert(
        {
          lesson_id: lessonRow.id,
          recap: typeof recapObj.recap === 'string' ? recapObj.recap : null,
          recap_json: recapObj,
          score: recapObj.score ?? null,
          talk_percentage: recapObj.talk_percentage ?? null,
          vocab_total_count: recapObj.vocab_total_count ?? null,
          vocab_level_distribution: recapObj.vocab_level_distribution ?? null,
          teacher_note: recapObj.teacher_note ?? null,
          audio_script: recapObj.audio_script ?? null,
        },
        { onConflict: 'lesson_id' },
      )
      if (se) throw se
      delivered = true
    }
  } catch (e: any) {
    console.error('recap publish bridge failed', e?.message || e)
    return NextResponse.json({ ok: true, delivered: false, warning: 'Published, but could not deliver to the student portal.' })
  }

  return NextResponse.json({ ok: true, delivered })
}
