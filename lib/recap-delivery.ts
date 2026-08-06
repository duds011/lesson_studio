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
import { pgSafeJson } from '@/lib/pg-json'

export type DeliveryResult =
  | { delivered: true; lessonId: string; studentId: string }
  | { delivered: false; reason: string }

export async function deliverRecapToStudent(eventId: string, rec: any): Promise<DeliveryResult> {
  const admin = createAdminClient()
  const linked = await mapEventToStudent(admin, eventId, rec?.attendees ?? [])
  if (!linked) return { delivered: false, reason: 'No student is linked to this recording.' }

  // Cleaned here, at the database boundary, rather than only where recaps are
  // generated — a draft written before that guard existed still has to publish.
  const recapObj: any = pgSafeJson(rec?.recap || {})
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

  /**
   * The lesson's words, as rows rather than only as JSON inside the recap.
   *
   * They were already in `recap_json.vocabulary`, but buried in a blob there
   * is no way to ask "when did I first meet this word" — that question spans
   * lessons, and a JSON column cannot be grouped across them. Written here,
   * every word carries the lesson it came from.
   *
   * Replaced rather than appended, so re-publishing an edited recap does not
   * leave the words it used to have.
   */
  const vocab = Array.isArray(recapObj.vocabulary) ? recapObj.vocabulary : []
  const rows = vocab
    .map((v: any, i: number) => ({
      lesson_id: lessonRow.id,
      word: String(v?.word ?? '').trim(),
      reading: v?.reading ? String(v.reading).trim() : null,
      definition: v?.definition ? String(v.definition).trim() : null,
      explanation: v?.explanation ? String(v.explanation).trim() : null,
      example_sentence: v?.example_sentence ? String(v.example_sentence).trim() : null,
      jlpt_level: v?.jlpt_level ? String(v.jlpt_level).trim() : null,
      sort_order: i,
    }))
    .filter((r: any) => r.word)

  await admin.from('vocabulary_items').delete().eq('lesson_id', lessonRow.id)
  if (rows.length) {
    // A recap that lands without its word rows is still a good recap, so this
    // is logged rather than thrown — it must not undo a successful publish.
    const { error: ve } = await admin.from('vocabulary_items').insert(rows)
    if (ve) console.error('vocabulary_items write failed', ve.message)
  }

  return { delivered: true, lessonId: lessonRow.id, studentId: linked.studentId }
}
