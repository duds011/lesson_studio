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
import { resolveBrand } from '@/lib/brand'
import { isEmailConfigured, sendEmail } from '@/lib/email'
import { PARTS_OF_SPEECH } from '@/lib/openai'
import { recapReadyHtml, recapReadySubject, recapReadyText } from '@/lib/emails/recap-ready'
import { noteFromRecap } from '@/lib/lesson-note'

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
  const key = Array.isArray(recapObj.vocabulary) ? recapObj.vocabulary : []
  const all = Array.isArray(recapObj.vocabulary_all) ? recapObj.vocabulary_all : []

  /**
   * A word keeps the level it was first given.
   *
   * Levels are the model's judgement, and asked twice it will sometimes answer
   * A2 and sometimes B1 for the same word. Left alone that makes the level
   * chart wander for reasons that have nothing to do with the student, so the
   * first answer wins and later lessons reuse it.
   */
  const { data: known } = await admin
    .from('vocabulary_items')
    .select('word, jlpt_level, lessons!inner ( student_id )')
    .eq('lessons.student_id', linked.studentId)
    .neq('lesson_id', lessonRow.id)
  const levelOf = new Map<string, string>()
  for (const k of ((known ?? []) as any[])) {
    const w = String(k.word ?? '').trim().toLocaleLowerCase()
    if (w && k.jlpt_level && !levelOf.has(w)) levelOf.set(w, k.jlpt_level)
  }

  // Key words first (they carry the detail the recap renders), then the rest of
  // the inventory. One row per distinct word in this lesson.
  const seen = new Set<string>()
  const rows: any[] = []
  const add = (word: string, level: string | null, isKey: boolean, detail?: any) => {
    const clean = word.trim()
    if (!clean) return
    const dedupe = clean.toLocaleLowerCase()
    if (seen.has(dedupe)) return
    seen.add(dedupe)
    rows.push({
      lesson_id: lessonRow.id,
      word: clean,
      reading: detail?.reading ? String(detail.reading).trim() : null,
      definition: detail?.definition ? String(detail.definition).trim() : null,
      explanation: detail?.explanation ? String(detail.explanation).trim() : null,
      example_sentence: detail?.example_sentence ? String(detail.example_sentence).trim() : null,
      jlpt_level: levelOf.get(dedupe) ?? (level ? String(level).trim() : null),
      // Only ever what the model actually returned, and only from the closed
      // set — a word tagged with something invented would fail the column's
      // check constraint and take the whole vocabulary write down with it.
      part_of_speech: PARTS_OF_SPEECH.includes(detail?.part_of_speech) ? detail.part_of_speech : null,
      sort_order: rows.length,
      is_key: isKey,
    })
  }

  for (const v of key) add(String(v?.word ?? ''), v?.jlpt_level ?? null, true, v)
  for (const v of all) add(String(v?.word ?? ''), v?.level ?? null, false)

  await admin.from('vocabulary_items').delete().eq('lesson_id', lessonRow.id)
  if (rows.length) {
    // A recap that lands without its word rows is still a good recap, so this
    // is logged rather than thrown — it must not undo a successful publish.
    const { error: ve } = await admin.from('vocabulary_items').insert(rows)
    if (ve) console.error('vocabulary_items write failed', ve.message)
  }

  // The teacher's own record of the lesson, so the Notes tab is already filled
  // by the time they go looking for it. Like the email below: last, and unable
  // to fail the publish.
  await writeTeacherNote(admin, linked.teacherId, linked.studentId, lessonDate, recapObj, title)

  // Everything the student can see is now in place, so tell them it is.
  // Deliberately last, and deliberately unable to fail the publish.
  await notifyStudent(admin, lessonRow.id, linked.studentId, linked.teacherId, title, lessonDate, recapObj)

  return { delivered: true, lessonId: lessonRow.id, studentId: linked.studentId }
}

/**
 * Fill in the teacher's note for this lesson.
 *
 * Written once and never rewritten: a teacher who already has something in
 * this cell — put there before publishing, or edited after we wrote it — owns
 * it, and re-publishing an edited recap must not replace her words with ours.
 * That is what makes this safe to run on every publish, repeats included.
 *
 * Nothing here can fail a publish. A missing note is a small loss; a recap
 * that refuses to publish because of one is a much larger one.
 */
async function writeTeacherNote(
  admin: ReturnType<typeof createAdminClient>,
  teacherId: string,
  studentId: string,
  lessonDate: string,
  recapObj: any,
  fallbackTitle: string,
) {
  try {
    const content = noteFromRecap(recapObj, fallbackTitle)
    if (!content) return

    const { data: existing } = await admin
      .from('student_notes')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId)
      .eq('note_date', lessonDate)
      .maybeSingle()
    if (existing) return

    const { error } = await admin.from('student_notes').insert({
      teacher_id: teacherId,
      student_id: studentId,
      content,
      note_date: lessonDate,
      pinned: false,
    })
    if (error) console.error('student_notes write failed', error.message)
  } catch (e: any) {
    console.error('student_notes write failed', e?.message || e)
  }
}

/**
 * Email the student that their recap is up.
 *
 * Sent ONCE per lesson, guarded by lessons.recap_notified_at. A teacher who
 * edits a recap and publishes again is correcting their own work, not
 * announcing it a second time — and the publish button is easy to press twice.
 *
 * The whole thing is best-effort: no throw escapes, because the recap is
 * already delivered and a bounced notification must not be reported as a
 * failed publish.
 */
async function notifyStudent(
  admin: any,
  lessonId: string,
  studentId: string,
  teacherId: string,
  lessonTitle: string,
  lessonDate: string,
  recapObj: any,
): Promise<void> {
  try {
    if (!isEmailConfigured()) return

    const { data: lesson } = await admin
      .from('lessons').select('recap_notified_at').eq('id', lessonId).maybeSingle()
    if ((lesson as any)?.recap_notified_at) return

    const { data: student } = await admin
      .from('students').select('full_name, email').eq('id', studentId).maybeSingle()
    const to = String((student as any)?.email ?? '').trim()
    if (!to) return // nothing to send to; not an error

    const { data: teacher } = await admin
      .from('profiles').select('full_name, email, brand').eq('id', teacherId).maybeSingle()
    const brand = resolveBrand((teacher as any)?.brand)

    const words = (Array.isArray(recapObj?.vocabulary) ? recapObj.vocabulary : [])
      .map((v: any) => String(v?.word ?? '').trim())
      .filter(Boolean)
      .slice(0, 6)

    const input = {
      studentName: String((student as any)?.full_name ?? '').split(' ')[0] || 'there',
      teacherName: String((teacher as any)?.full_name ?? '').split(' ')[0] || 'Your teacher',
      portalName: brand.portalName,
      accent: brand.accent,
      lessonTitle,
      lessonDate,
      score: typeof recapObj?.score === 'number' ? recapObj.score : null,
      talkPct: typeof recapObj?.talk_percentage === 'number' ? recapObj.talk_percentage : null,
      words,
    }

    // Claimed BEFORE sending. If the send throws after the mail has actually
    // gone out, a retry would send a second copy; a claimed-but-unsent
    // notification is the cheaper mistake.
    await admin.from('lessons').update({ recap_notified_at: new Date().toISOString() }).eq('id', lessonId)

    const res = await sendEmail({
      to,
      subject: recapReadySubject(input),
      html: recapReadyHtml(input),
      text: recapReadyText(input),
      from: `${brand.portalName} <${(process.env.RECAP_FROM_EMAIL || 'recaps@koku-library.app').replace(/^.*<|>.*$/g, '')}>`,
      replyTo: String((teacher as any)?.email ?? '').trim() || undefined,
    })
    if (!res.sent) {
      console.error(`[recap-delivery] notification not sent for ${lessonId}: ${res.reason}`)
      // Let a later publish try again — the student never got anything.
      await admin.from('lessons').update({ recap_notified_at: null }).eq('id', lessonId)
      return
    }
    console.log(`[recap-delivery] notified ${to} about ${lessonId} (${res.id})`)
  } catch (e: any) {
    console.error('[recap-delivery] notification failed:', e?.message || e)
  }
}
