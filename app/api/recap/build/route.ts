import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentUser } from '@/lib/auth'
import { transcribeTracks, toWhisperLanguage } from '@/lib/whisper'
import { normalizeSegments } from '@/lib/transcript'
import { generateRecap } from '@/lib/openai'
import { saveRecap } from '@/lib/store'
import { runAsTeacher } from '@/lib/teacher-scope'
import { RECORDING_BUCKET, trackPath } from '@/lib/ext-storage'

export const dynamic = 'force-dynamic'
// Two Whisper round trips plus a long completion — the default 60s is not close.
export const maxDuration = 300

/**
 * Rebuild a recap from the recording it was originally made from.
 *
 * The recording is never deleted, so a lesson recapped under an older prompt
 * can be run through the current one. It lands as a DRAFT under the same event
 * id, which means the ordinary review page opens it and "Approve & send"
 * upserts the very same lesson row (lessons.source_event_id is unique) — so a
 * rebuild updates the student's copy in place rather than duplicating it.
 *
 * Teacher-only: the middleware gates /api/recap/*, and ownership is checked
 * again here against the recording's own student.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { eventId, micIs } = await req.json().catch(() => ({}))
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })

  // Only extension recordings can be rebuilt — they are the ones whose audio we
  // still hold. (Bot recordings predate this pipeline and are no longer used.)
  const recordingId = String(eventId).startsWith('ext:') ? String(eventId).slice(4) : ''
  if (!recordingId) {
    return NextResponse.json({ ok: false, error: 'This recap has no stored recording to rebuild from.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Who the recording belongs to, and that it is this teacher's to rebuild.
  const { data: link } = await admin
    .from('lesson_event_links')
    .select('student_id, teacher_id')
    .eq('event_id', eventId)
    .maybeSingle()
  if (!link) return NextResponse.json({ ok: false, error: 'No student is linked to this recording.' }, { status: 404 })
  if (link.teacher_id !== user.id) return NextResponse.json({ ok: false, error: 'Not your recording.' }, { status: 403 })

  const { data: student } = await admin
    .from('students').select('id, full_name, language').eq('id', link.student_id).single()
  if (!student) return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 })

  try {
    // Whoever held the mic decides which track is the host. Unspecified means
    // the teacher recorded, which is the recorder's own default.
    const micIsTeacher = micIs !== 'student'
    const wanted = [
      { track: 'mic', speaker: micIsTeacher ? 'Teacher' : student.full_name, isHost: micIsTeacher },
      { track: 'tab', speaker: micIsTeacher ? student.full_name : 'Teacher', isHost: !micIsTeacher },
    ]

    const tracks = []
    for (const w of wanted) {
      const { data, error } = await admin.storage.from(RECORDING_BUCKET).download(trackPath(recordingId, w.track))
      if (error || !data) {
        return NextResponse.json({ ok: false, error: `The ${w.track} recording is no longer in storage.` }, { status: 404 })
      }
      if (data.size > 0) tracks.push({ blob: data, speaker: w.speaker, isHost: w.isHost })
    }
    if (!tracks.length) return NextResponse.json({ ok: false, error: 'Both tracks were empty.' }, { status: 422 })

    // The student's own language, not the teacher's: it is the field that says
    // what THIS student is being taught, and it picks the prompt.
    const language = student.language || undefined
    const segments = await transcribeTracks(tracks, toWhisperLanguage(language))
    const t = normalizeSegments(segments)
    if (!t.plain.trim()) return NextResponse.json({ ok: false, error: 'Nothing was said on either track.' }, { status: 422 })

    const recap: any = await generateRecap({ studentName: student.full_name, transcript: t.plain, language })
    if (t.studentTalkPct != null) recap.talk_percentage = t.studentTalkPct
    recap.metrics = t.metrics

    // Keep the date the lesson already has, so a rebuild does not move it.
    const { data: lesson } = await admin
      .from('lessons').select('lesson_date, title').eq('source_event_id', eventId).maybeSingle()

    await runAsTeacher(link.teacher_id, async () => {
      await saveRecap({
        eventId,
        studentName: student.full_name,
        recap,
        talk: t.talk,
        studentTalkPct: t.studentTalkPct,
        status: 'draft',
        createdAt: Date.now(),
        lessonDate: lesson?.lesson_date || new Date().toISOString().slice(0, 10),
        lessonTitle: recap.lesson_title || lesson?.title || 'Recorded lesson',
      })
    })

    return NextResponse.json({
      ok: true,
      eventId,
      corrections: Array.isArray(recap.corrections) ? recap.corrections.length : 0,
      studentTalkPct: t.studentTalkPct,
    })
  } catch (e: any) {
    console.error('recap rebuild failed', e?.message || e)
    return NextResponse.json({ ok: false, error: e?.message || 'Rebuild failed.' }, { status: 500 })
  }
}
