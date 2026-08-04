/**
 * Bridges a built recap to the student's Supabase record — the step that makes
 * it appear in their portal.
 *
 * Extracted from the publish route so it can be re-run. Publishing marks the
 * recap published *and* delivers it; when only the delivery half failed, the
 * recap looked published forever with nothing behind it and the UI offered no
 * way to try again.
 */
import { createAdminClient } from '@/lib/supabase/admin'
import { mapEventToStudent } from '@/lib/lesson-link'

export type DeliveryResult =
  | { delivered: true; lessonId: string; studentId: string }
  | { delivered: false; reason: string }

export async function deliverRecapToStudent(eventId: string, rec: any): Promise<DeliveryResult> {
  const admin = createAdminClient()
  const linked = await mapEventToStudent(admin, eventId, rec?.attendees ?? [])
  if (!linked) return { delivered: false, reason: 'No student is linked to this recording.' }

  const recapObj: any = rec?.recap || {}
  const lessonDate = rec?.lessonDate ? String(rec.lessonDate).slice(0, 10) : new Date().toISOString().slice(0, 10)
  const title =
    (typeof recapObj.lesson_title === 'string' && recapObj.lesson_title.trim()) || rec?.lessonTitle || 'Lesson'

  const { data: lessonRow, error: le } = await admin
    .from('lessons')
    .upsert(
      {
        teacher_id: linked.teacherId,
        student_id: linked.studentId,
        title,
        lesson_date: lessonDate,
        status: 'published',
        source_event_id: eventId,
      },
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

  return { delivered: true, lessonId: lessonRow.id, studentId: linked.studentId }
}
