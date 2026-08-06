import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentUser } from '@/lib/auth'
import { saveRecap } from '@/lib/store'
import { runAsTeacher } from '@/lib/teacher-scope'

export const dynamic = 'force-dynamic'

/**
 * Reopen a published lesson for editing.
 *
 * A recap is edited as a draft (KV) and published into Supabase, so once it
 * was sent there was no way back: the lesson page could only rebuild the whole
 * thing from the recording or delete it, and a teacher who just wanted to fix
 * one wrong correction had neither.
 *
 * This copies the published recap back into a draft under the lesson's own
 * event id, so the ordinary review page opens it and "Approve & send" writes
 * it back over the same lesson row.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { lessonId } = await req.json().catch(() => ({}))
  if (!lessonId) return NextResponse.json({ ok: false, error: 'Missing lessonId' }, { status: 400 })

  const admin = createAdminClient()
  const { data: lesson } = await admin
    .from('lessons')
    .select('id, title, lesson_date, teacher_id, source_event_id, students ( full_name )')
    .eq('id', lessonId)
    .maybeSingle()

  if (!lesson) return NextResponse.json({ ok: false, error: 'Lesson not found.' }, { status: 404 })
  if (lesson.teacher_id !== user.id) return NextResponse.json({ ok: false, error: 'Not your lesson.' }, { status: 403 })

  // Publishing keys on source_event_id. Without one there is nothing to write
  // back to, and approving would create a second lesson rather than update it.
  const eventId = lesson.source_event_id
  if (!eventId) {
    return NextResponse.json(
      { ok: false, error: 'This lesson was not created from a recording, so it cannot be reopened for editing.' },
      { status: 400 },
    )
  }

  const { data: summary } = await admin
    .from('lesson_summaries')
    .select('recap_json, talk_percentage')
    .eq('lesson_id', lesson.id)
    .maybeSingle()

  if (!summary?.recap_json) {
    return NextResponse.json({ ok: false, error: 'This lesson has no recap to edit.' }, { status: 404 })
  }

  const studentName = ((lesson as any).students?.full_name)
    ?? (Array.isArray((lesson as any).students) ? (lesson as any).students[0]?.full_name : '')
    ?? 'Student'

  await runAsTeacher(user.id, async () => {
    await saveRecap({
      eventId,
      studentName,
      recap: summary.recap_json,
      talk: [],
      studentTalkPct: summary.talk_percentage ?? null,
      status: 'draft',
      createdAt: Date.now(),
      lessonDate: lesson.lesson_date ?? undefined,
      lessonTitle: lesson.title ?? undefined,
    })
  })

  return NextResponse.json({ ok: true, eventId })
}
