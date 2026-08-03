import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticateExtension } from '@/lib/ext-auth'
import { transcribeTracks } from '@/lib/whisper'
import { normalizeSegments } from '@/lib/recall'
import { generateRecap } from '@/lib/openai'
import { saveRecap } from '@/lib/store'
import { runAsTeacher } from '@/lib/teacher-scope'
import { RECORDING_BUCKET, trackPath } from '@/lib/ext-storage'

export const dynamic = 'force-dynamic'
// Two Whisper round trips on a full lesson comfortably exceeds the default 60s.
export const maxDuration = 300

/**
 * Turns an uploaded extension recording into a draft recap.
 *
 * The recap is stored under a synthetic `ext:` event id and linked to the
 * student through lesson_event_links, so it lands in the same "Recaps to
 * review" queue as a bot recording and publishes through the same path.
 */
export async function POST(req: Request) {
  const caller = await authenticateExtension(req)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recordingId, studentId, micIs, seconds, lessonDate, heard, language } = await req.json().catch(() => ({}))
  if (!recordingId || !studentId) return NextResponse.json({ error: 'Missing recordingId or studentId' }, { status: 400 })

  const admin = createAdminClient()
  const { data: student } = await admin
    .from('students').select('id, full_name').eq('id', studentId).eq('teacher_id', caller.teacherId).maybeSingle()
  if (!student) return NextResponse.json({ error: 'Student not found for this teacher' }, { status: 404 })

  try {
    // Whoever holds the mic decides which track is the host. Recording your own
    // lesson as the learner is the same flow with the roles swapped.
    const micIsTeacher = micIs !== 'student'
    const wanted = [
      { track: 'mic', speaker: micIsTeacher ? 'Teacher' : student.full_name, isHost: micIsTeacher },
      { track: 'tab', speaker: micIsTeacher ? student.full_name : 'Teacher', isHost: !micIsTeacher },
    ]

    // Seconds of real sound the recorder measured per track. A track that heard
    // essentially nothing is skipped: transcribing silence does not yield an
    // empty result, it yields invented speech.
    const MIN_HEARD_SEC = 1.5
    const tracks = []
    for (const w of wanted) {
      const loud = heard && typeof heard[w.track] === 'number' ? heard[w.track] : null
      if (loud !== null && loud < MIN_HEARD_SEC) continue

      const { data, error } = await admin.storage.from(RECORDING_BUCKET).download(trackPath(recordingId, w.track))
      if (error || !data) return NextResponse.json({ error: `Missing ${w.track} track: ${error?.message ?? 'not found'}` }, { status: 404 })
      if (data.size > 0) tracks.push({ blob: data, speaker: w.speaker, isHost: w.isHost })
    }
    if (!tracks.length) return NextResponse.json({ error: 'Both tracks were empty.' }, { status: 422 })

    const segments = await transcribeTracks(tracks)
    const t = normalizeSegments(segments)
    if (!t.plain.trim()) return NextResponse.json({ error: 'Nothing was said on either track.' }, { status: 422 })

    const recap: any = await generateRecap({ studentName: student.full_name, transcript: t.plain, language })
    if (t.studentTalkPct != null) recap.talk_percentage = t.studentTalkPct
    recap.metrics = t.metrics

    const eventId = `ext:${recordingId}`
    // Link first, so publishing resolves the student without a calendar event.
    await admin.from('lesson_event_links').upsert(
      { event_id: eventId, student_id: student.id },
      { onConflict: 'event_id' },
    )

    // Recaps are runtime docs namespaced per teacher, and a bearer-token
    // request carries no session for the store to resolve one from — so say
    // explicitly whose data this is.
    await runAsTeacher(caller.teacherId, async () => {
      await saveRecap({
        eventId,
        studentName: student.full_name,
        recap,
        talk: t.talk,
        studentTalkPct: t.studentTalkPct,
        status: 'draft',
        createdAt: Date.now(),
        lessonDate: lessonDate || new Date().toISOString().slice(0, 10),
        lessonTitle: recap.title || 'Recorded lesson',
      })
    })

    return NextResponse.json({
      ok: true,
      eventId,
      seconds: seconds ?? null,
      studentTalkPct: t.studentTalkPct,
      speakers: t.talk.map((s) => s.name),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to build the recap.' }, { status: 500 })
  }
}
