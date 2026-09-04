import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticateExtension } from '@/lib/ext-auth'
import { transcribeTracksDetailed, assembleTracks, toWhisperLanguage } from '@/lib/whisper'
import { normalizeSegments } from '@/lib/transcript'
import { toRealTime } from '@/lib/cutmap'
import { checkRecapQuota, recordRecapRun } from '@/lib/recap-quota'
import { generateRecap } from '@/lib/openai'
import { saveRecap } from '@/lib/store'
import { runAsTeacher } from '@/lib/teacher-scope'
import { RECORDING_BUCKET, trackPath, transcriptPath, type CachedTranscript } from '@/lib/ext-storage'
import { overLessonLimit, TOO_LONG_MESSAGE } from '@/lib/lesson-limits'

export const dynamic = 'force-dynamic'
/**
 * Two Whisper round trips on a full lesson comfortably exceeds the default 60s
 * — and, as a 52-minute lesson proved, 300s as well. The product accepts
 * lessons up to MAX_LESSON_SECONDS (55 minutes), so this has to be able to
 * finish one: at 300 it accepted recordings it could not process, and the
 * teacher lost the lesson with no error to show for it.
 *
 * Raising this alone does nothing — the fetch inside used to abort at 300s
 * whatever this said. Both had to move together; see lib/long-post.
 */
export const maxDuration = 800

/**
 * Turns an uploaded extension recording into a draft recap.
 *
 * The recap is stored under a synthetic `ext:` event id and linked to the
 * student through lesson_event_links, so it lands in the "Recaps to review"
 * queue and publishes through the same path as calendar-linked lessons.
 */
export async function POST(req: Request) {
  const caller = await authenticateExtension(req)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recordingId, studentId, seconds, lessonDate, heard, language, spokenLanguage, cutMaps } =
    await req.json().catch(() => ({}))
  if (!recordingId) return NextResponse.json({ error: 'Missing recordingId' }, { status: 400 })

  /**
   * Who holds the mic is not a question to ask — the signed-in account IS the
   * answer. A teacher's install records the teacher; a student account (the
   * standalone student product) records the student. Derived here, once, and
   * remembered on the link so rebuilds never guess.
   */
  const admin0 = createAdminClient()
  const { data: callerProfile } = await admin0
    .from('profiles').select('role, speaking_language').eq('id', caller.teacherId).maybeSingle()
  const micIs = (callerProfile as any)?.role === 'student' ? 'student' : 'teacher'

  // The upload-init check already turned this away once, but that one guards
  // storage and this one guards the invoice: everything expensive happens
  // below, and nothing stops a caller from skipping straight to here.
  if (overLessonLimit(seconds)) {
    return NextResponse.json({ error: TOO_LONG_MESSAGE }, { status: 413 })
  }

  const admin = createAdminClient()

  /**
   * No student means the recorder did not ask — which is now the normal case.
   *
   * The audio is already in storage; it waits in the queue until the teacher
   * files it in the studio, and filing is what starts the build. Nothing
   * expensive runs here, so a recording of the wrong thing costs nothing but
   * a click to delete.
   */
  if (!studentId) {
    const { error } = await admin.from('pending_recordings').upsert(
      {
        recording_id: recordingId,
        teacher_id: caller.teacherId,
        seconds: typeof seconds === 'number' ? Math.round(seconds) : null,
        lesson_date: lessonDate || new Date().toISOString().slice(0, 10),
        mic_is: micIs ?? null,
        // Nobody to read a setting from yet. The recorder no longer asks, so
        // this is usually the teacher's own spoken language from onboarding;
        // filing the recording to a student later lets theirs take over.
        spoken_language: spokenLanguage || language || (callerProfile as any)?.speaking_language || null,
        heard: heard ?? null,
      },
      { onConflict: 'recording_id' },
    )
    if (error) return NextResponse.json({ error: `Could not save the recording: ${error.message}` }, { status: 500 })
    return NextResponse.json({ ok: true, pending: true, recordingId }, { status: 202 })
  }

  // `*` rather than a column list: `spoken_language` arrives in migration
  // 0032, and naming a column that does not exist yet fails the whole request.
  const { data: student } = await admin
    .from('students').select('*').eq('id', studentId).eq('teacher_id', caller.teacherId).maybeSingle()
  if (!student) return NextResponse.json({ error: 'Student not found for this teacher' }, { status: 404 })

  /**
   * What this hour is spoken in, settled here rather than in the popup.
   *
   * The recorder used to ask before every lesson and keep the answer in one
   * browser's storage. It is a fact about the student, so the student's own
   * record wins; failing that the teacher's onboarding answer, and only then
   * whatever an extension that has not updated yet happened to send.
   */
  const spokenResolved =
    (typeof (student as any).spoken_language === 'string' && (student as any).spoken_language.trim()) ||
    (typeof (callerProfile as any)?.speaking_language === 'string' && (callerProfile as any).speaking_language.trim()) ||
    (typeof spokenLanguage === 'string' && spokenLanguage) ||
    (typeof language === 'string' && language) ||
    null

  // Checked before the upload is claimed, so a teacher over the ceiling is
  // told plainly instead of having the recording silently swallowed.
  const quota = await checkRecapQuota(caller.teacherId)
  if (!quota.ok) return NextResponse.json({ error: quota.message }, { status: 429 })

  const eventId = `ext:${recordingId}`

  /**
   * Claim the recording before answering.
   *
   * This row is what ties the audio to a student. Written here rather than
   * after the recap, because when it was written after, a failed build left
   * audio in storage that nothing could identify — no queue entry, no student,
   * and "Rebuild from recording" resolves the student through this exact row,
   * so the one case it could not help with was the one that needed it. With
   * the row up front, a build that dies leaves a lesson the studio can rebuild.
   */
  const { error: linkError } = await admin.from('lesson_event_links').upsert(
    {
      event_id: eventId,
      student_id: student.id,
      teacher_id: caller.teacherId,
      // Who held the mic, remembered — so a rebuild months later doesn't have
      // to guess and flip the speakers (it used to assume "teacher", which
      // inverted every lesson a student recorded of themselves).
      mic_is: micIs === 'student' ? 'student' : micIs === 'teacher' ? 'teacher' : null,
      // What the room actually spoke, remembered for the same reason: a
      // rebuild re-transcribes with this hint, not the target language.
      spoken_language: spokenResolved,
    },
    { onConflict: 'event_id' },
  )
  if (linkError) {
    return NextResponse.json({ error: `Could not link the recording to the student: ${linkError.message}` }, { status: 500 })
  }

  /**
   * Answer now; transcribe after.
   *
   * Transcription and the recap take minutes, and the extension used to hold
   * the connection open for all of it — which meant the teacher could not
   * start her next lesson until a recap she was not waiting for had finished
   * building. The upload is the extension's job and it is done; the rest is
   * the studio's, and the draft appears when it appears.
   *
   * waitUntil keeps the function alive past the response. Failures land in the
   * log rather than in the teacher's hand, which is why the link row above
   * matters: it is what makes a failure recoverable instead of invisible.
   */
  // A placeholder in the review queue from the moment it is claimed, so a
  // lesson that is still transcribing looks different from one never sent.
  const placeholder = {
    eventId,
    studentName: student.full_name,
    recap: null,
    talk: [],
    studentTalkPct: null,
    createdAt: Date.now(),
    lessonDate: lessonDate || new Date().toISOString().slice(0, 10),
    lessonTitle: 'Building the recap…',
  }
  await runAsTeacher(caller.teacherId, () => saveRecap({ ...placeholder, status: 'processing' }))

  waitUntil(
    // The resolved answer, not the posted one — the build must transcribe with
    // the same hint the link just recorded.
    buildRecap({ admin, caller, student, recordingId, eventId, micIs, lessonDate, heard, language, spokenLanguage: spokenResolved, cutMaps })
      .catch(async (e) => {
        const error = String(e?.message ?? e)
        console.error(`[ext/complete] recap build failed for ${eventId}: ${error}`)
        // Say so where the teacher will look. The audio is still in storage and
        // the link row exists, so this row's Retry can rebuild it.
        await runAsTeacher(caller.teacherId, () =>
          saveRecap({ ...placeholder, status: 'failed', error, lessonTitle: 'Recap failed' }),
        ).catch(() => { /* nothing left to do but the log above */ })
      }),
  )

  return NextResponse.json({ ok: true, queued: true, eventId, student: student.full_name }, { status: 202 })
}

/** Everything the extension no longer waits for. */
async function buildRecap({
  admin, caller, student, recordingId, eventId, micIs, lessonDate, heard, language, spokenLanguage, cutMaps,
}: any) {
  {
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
    // `track` rides along so the transcript cache can be keyed by it.
    const tracks: { blob: Blob; speaker: string; isHost: boolean; track: string }[] = []
    for (const w of wanted) {
      const loud = heard && typeof heard[w.track] === 'number' ? heard[w.track] : null
      if (loud !== null && loud < MIN_HEARD_SEC) continue

      const { data, error } = await admin.storage.from(RECORDING_BUCKET).download(trackPath(recordingId, w.track))
      if (error || !data) throw new Error(`Missing ${w.track} track: ${error?.message ?? 'not found'}`)
      if (data.size > 0) tracks.push({ blob: data, speaker: w.speaker, isHost: w.isHost, track: w.track })
    }
    if (!tracks.length) throw new Error('Both tracks were empty.')

    /**
     * Two different questions, which used to share one answer.
     *
     * Whisper needs the language that is actually SPOKEN in the room. In a
     * beginner lesson most of that is the language teacher and student share,
     * not the one being taught — and forcing the target language onto it does
     * not skip those parts, it renders them as target-language nonsense.
     *
     * The recap needs the language being LEARNED, so it knows what counts as a
     * learner error rather than ordinary conversation.
     *
     * `spokenLanguage` is what the recorder now asks for; `language` is the old
     * single field, kept so an extension that has not updated yet still works.
     */
    const code = toWhisperLanguage(spokenLanguage ?? language)
    const targetLanguage = student.language ?? language ?? null

    const det = await transcribeTracksDetailed(tracks, code)

    /**
     * Silence-stripped recordings arrive in compressed time. Shift every word
     * back onto the real lesson clock BEFORE interleaving and BEFORE caching,
     * so speaker order, talk-time, and any later rebuild all live in real
     * time and never need to know stripping happened.
     */
    const remapped = det.words.map((w: any, i: number) => ({
      ...w,
      words: toRealTime(w.words, cutMaps?.[tracks[i].track] ?? null),
    }))
    const t = normalizeSegments(assembleTracks(remapped).filtered)
    if (!t.plain.trim()) throw new Error('Nothing was said on either track.')

    /**
     * Save the words next to the audio they came from.
     *
     * Transcription is the expensive half of a recap, and rebuilding one under
     * a better prompt does not need to hear the lesson again. Stored per TRACK
     * rather than per speaker, so a rebuild that corrects who held the mic can
     * still reassign them.
     *
     * Best-effort on purpose: the recap in hand is worth more than the cache,
     * so a storage failure here is logged and swallowed rather than thrown.
     */
    const cache: CachedTranscript = {
      v: 1,
      language: code ?? null,
      createdAt: new Date().toISOString(),
      tracks: Object.fromEntries(remapped.map((w: any, i: number) => [tracks[i].track, w.words])),
    }
    const { error: cacheError } = await admin.storage
      .from(RECORDING_BUCKET)
      .upload(transcriptPath(recordingId), JSON.stringify(cache), {
        contentType: 'application/json',
        upsert: true,
      })
    if (cacheError) console.warn(`[ext/complete] could not cache transcript: ${cacheError.message}`)

    const recap: any = await generateRecap({
      studentName: student.full_name,
      transcript: t.plain,
      language: targetLanguage ?? undefined,
      // The language THIS student is explained in — English when unset.
      instructionLanguage: (student as any).instruction_language,
      script: (student as any).jp_script,
    })
    await recordRecapRun(caller.teacherId, 'extension')
    if (t.studentTalkPct != null) recap.talk_percentage = t.studentTalkPct
    recap.metrics = t.metrics

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
        lessonTitle: recap.lesson_title || recap.title || 'Recorded lesson',
      })
    })

    console.log(`[ext/complete] built ${eventId} for ${student.full_name} — ${t.talk.map((s: any) => s.name).join(' + ')}`)
  }
}
