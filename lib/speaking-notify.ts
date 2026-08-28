import { isEmailConfigured, sendEmail } from '@/lib/email'
import { resolveBrand } from '@/lib/brand'
import { lessonDisplayTitle } from '@/lib/portal-utils'
import { speakingPromptLabel, type Exercise } from '@/lib/speaking'
import {
  speakingSubmittedHtml, speakingSubmittedSubject, speakingSubmittedText,
} from '@/lib/emails/speaking-submitted'

/**
 * How long a lesson stays quiet after one of these has gone out. A student
 * working through the three speaking exercises in one sitting is one event;
 * the same student coming back tomorrow is a new one worth hearing about.
 */
const QUIET_MS = 2 * 60 * 60 * 1000

/**
 * Tell the teacher a speaking answer landed.
 *
 * Best-effort in the same sense as the student's recap mail: the recording is
 * already stored and visible on the lesson page, so nothing here may throw or
 * fail the upload it follows.
 */
export async function notifyTeacherOfSpeaking(admin: any, lessonId: string, studentId: string): Promise<void> {
  try {
    if (!isEmailConfigured()) return

    const { data: lesson } = await admin
      .from('lessons')
      .select('id, lesson_number, title, teacher_id, student_id, speaking_notified_at, lesson_summaries ( recap_json )')
      .eq('id', lessonId)
      .maybeSingle()
    if (!lesson) return

    const last = lesson.speaking_notified_at ? Date.parse(lesson.speaking_notified_at) : 0
    if (last && Date.now() - last < QUIET_MS) return

    const { data: teacher } = await admin
      .from('profiles').select('full_name, email, brand').eq('id', lesson.teacher_id).maybeSingle()
    const to = String(teacher?.email ?? '').trim()
    if (!to) return

    const { data: student } = await admin
      .from('students').select('full_name').eq('id', studentId).maybeSingle()

    // Which prompts they have answered so far on this lesson — the mail is a
    // summary of the sitting, not a receipt for the last file.
    const { data: takes } = await admin
      .from('student_audio_submissions')
      .select('prompt_index')
      .eq('lesson_id', lessonId)
      .not('prompt_index', 'is', null)
      .order('prompt_index')

    const summary = Array.isArray(lesson.lesson_summaries) ? lesson.lesson_summaries[0] : lesson.lesson_summaries
    const recap = summary?.recap_json
    const exercises: Exercise[] = Array.isArray(recap?.exercises) ? recap.exercises : []
    const prompts = (takes ?? [])
      .map((t: any) => exercises[t.prompt_index])
      .filter(Boolean)
      .map(speakingPromptLabel)

    const brand = resolveBrand(teacher?.brand)
    const input = {
      teacherName: String(teacher?.full_name ?? '').split(' ')[0] || 'there',
      studentName: String(student?.full_name ?? '').split(' ')[0] || 'Your student',
      lessonTitle: lessonDisplayTitle(recap, lesson.title, lesson.lesson_number),
      lessonNumber: typeof lesson.lesson_number === 'number' ? lesson.lesson_number : null,
      lessonPath: `/teacher/students/${lesson.student_id}/lessons/${lesson.id}`,
      prompts,
      accent: brand.accent,
    }

    // Claimed before sending, same reasoning as the recap notification: a
    // claimed-but-unsent mail is cheaper than a second copy.
    await admin.from('lessons').update({ speaking_notified_at: new Date().toISOString() }).eq('id', lessonId)

    const res = await sendEmail({
      to,
      subject: speakingSubmittedSubject(input),
      html: speakingSubmittedHtml(input),
      text: speakingSubmittedText(input),
    })
    if (!res.sent) {
      console.error(`[speaking-notify] not sent for ${lessonId}: ${res.reason}`)
      await admin.from('lessons').update({ speaking_notified_at: last ? new Date(last).toISOString() : null }).eq('id', lessonId)
      return
    }
    console.log(`[speaking-notify] told ${to} about ${lessonId} (${res.id})`)
  } catch (e: any) {
    console.error('[speaking-notify] failed:', e?.message || e)
  }
}
