import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentUser } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import { transcribeTracksDetailed, assembleTracks, toWhisperLanguage, type TrackWords } from '@/lib/whisper'
import { normalizeSegments } from '@/lib/transcript'
import { generateRecap } from '@/lib/openai'
import { saveRecap } from '@/lib/store'
import { runAsTeacher } from '@/lib/teacher-scope'
import { RECORDING_BUCKET, trackPath, transcriptPath, type CachedTranscript } from '@/lib/ext-storage'

export const dynamic = 'force-dynamic'
/**
 * Above the 300s the rest of the pipeline uses, because 300s is exactly what
 * broke the lesson this route exists to undo: transcribing Kazuyuki's tab
 * track alone returned 504 at 301 seconds, twice. One track of a 47-minute
 * lesson can exceed five minutes on whisper-1 with word timestamps, and those
 * are not optional — the talk-time split and every speaking metric are
 * computed from them.
 *
 * 800 requires a paid plan; on Hobby this is not clamped, it fails the build.
 * Combined with one-track-per-call below, a lesson would have to be extremely
 * long for any single request to run out of time.
 */
export const maxDuration = 800

/**
 * Rebuild a recap from a recording whose original send died.
 *
 * A lesson can upload cleanly and still never become a recap: the audio lands
 * in storage, then the transcribe-and-write step fails, and because that step
 * is what writes lesson_event_links there is afterwards nothing tying the
 * recording to a student — so the ordinary "Rebuild from recording" button
 * cannot find it, and the teacher has no way back to their own lesson. This is
 * that way back. It takes the recording id and the student it belongs to, and
 * leaves a draft in that teacher's review queue.
 *
 * RESUMABLE, one track per call. The original failure was almost certainly the
 * 300s function ceiling — a 47-minute lesson is two Whisper passes and a long
 * completion, and the successful recaps were already running 2–4 minutes. So
 * this never tries to do it all at once: each call transcribes one track and
 * saves the words next to the audio, and the call that finds every track
 * already transcribed writes the recap. Re-post until `done` comes back true.
 * Transcription is ~85% of the cost and is never paid twice.
 *
 * Admin-only, and it 404s for everyone else — same posture as /admin, because
 * an endpoint that spends money on someone else's behalf should not advertise
 * itself to the people who cannot use it. CRON_SECRET is accepted as a second
 * way in, the same bearer the purge sweep uses: a recovery is operator work and
 * has to be runnable from a terminal, not only from a signed-in browser.
 */
export async function POST(req: Request) {
  const secret = (process.env.CRON_SECRET ?? '').replace(/^﻿/, '').trim()
  const bearer = secret && req.headers.get('authorization') === `Bearer ${secret}`
  if (!bearer) {
    const supabase = await createClient()
    const user = await currentUser(supabase)
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }

  const { recordingId, studentId, lessonDate, micIs } = await req.json().catch(() => ({}))
  if (!recordingId || !studentId) {
    return NextResponse.json({ ok: false, error: 'Missing recordingId or studentId' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: student } = await admin
    .from('students')
    .select('id, full_name, language, instruction_language, teacher_id')
    .eq('id', studentId)
    .maybeSingle()
  if (!student) return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 })

  // Whoever held the mic decides which track is the host — the recorder's own
  // default is the teacher, and these recoveries all come from that recorder.
  const micIsTeacher = micIs !== 'student'
  const wanted = [
    { track: 'mic', speaker: micIsTeacher ? 'Teacher' : student.full_name, isHost: micIsTeacher },
    { track: 'tab', speaker: micIsTeacher ? student.full_name : 'Teacher', isHost: !micIsTeacher },
  ]

  const language = student.language || undefined
  const code = toWhisperLanguage(language)
  const eventId = `ext:${recordingId}`

  try {
    // ── what has already been transcribed ──
    let cache: CachedTranscript = {
      v: 1,
      language: code ?? null,
      createdAt: new Date().toISOString(),
      tracks: {},
    }
    const cached = await admin.storage.from(RECORDING_BUCKET).download(transcriptPath(recordingId))
    if (cached.data) {
      try {
        const parsed = JSON.parse(await cached.data.text()) as CachedTranscript
        if (parsed?.v === 1 && parsed.tracks) cache = parsed
      } catch {
        /* unreadable cache is the same as no cache — transcribe again */
      }
    }

    // ── one track per call, so no single request can run out of time ──
    const missing = wanted.filter((w) => !Array.isArray(cache.tracks[w.track]) || !cache.tracks[w.track].length)
    if (missing.length > 0) {
      const next = missing[0]
      const { data, error } = await admin.storage
        .from(RECORDING_BUCKET)
        .download(trackPath(recordingId, next.track))
      if (error || !data) {
        return NextResponse.json(
          { ok: false, error: `The ${next.track} track is not in storage: ${error?.message ?? 'not found'}` },
          { status: 404 },
        )
      }
      if (data.size === 0) {
        return NextResponse.json({ ok: false, error: `The ${next.track} track is empty.` }, { status: 422 })
      }

      const det = await transcribeTracksDetailed(
        [{ blob: data, speaker: next.speaker, isHost: next.isHost }],
        code,
      )
      cache.tracks[next.track] = det.words[0]?.words ?? []
      cache.language = code ?? null

      // Written before returning: this is the expensive half, and a crash on
      // the next call must not mean paying to hear the lesson again.
      const { error: cacheError } = await admin.storage
        .from(RECORDING_BUCKET)
        .upload(transcriptPath(recordingId), JSON.stringify(cache), {
          contentType: 'application/json',
          upsert: true,
        })
      if (cacheError) throw new Error(`Transcribed ${next.track} but could not save it: ${cacheError.message}`)

      const left = wanted.filter((w) => !Array.isArray(cache.tracks[w.track]) || !cache.tracks[w.track].length)
      return NextResponse.json({
        ok: true,
        done: false,
        transcribed: next.track,
        words: cache.tracks[next.track].length,
        remaining: left.map((w) => w.track),
      })
    }

    // ── every track is in hand: assemble, write the recap ──
    const fromCache: TrackWords[] = wanted
      .filter((w) => Array.isArray(cache.tracks[w.track]) && cache.tracks[w.track].length)
      .map((w) => ({ speaker: w.speaker, isHost: w.isHost, words: cache.tracks[w.track] }))

    const t = normalizeSegments(assembleTracks(fromCache).filtered)
    if (!t.plain.trim()) return NextResponse.json({ ok: false, error: 'Nothing was said on either track.' }, { status: 422 })

    const recap: any = await generateRecap({
      studentName: student.full_name,
      transcript: t.plain,
      language,
      instructionLanguage: (student as any).instruction_language,
    })
    if (t.studentTalkPct != null) recap.talk_percentage = t.studentTalkPct
    recap.metrics = t.metrics

    // The row whose absence caused this. Publishing resolves the student
    // through it, so it has to exist before the draft is worth anything.
    const { error: linkError } = await admin.from('lesson_event_links').upsert(
      { event_id: eventId, student_id: student.id, teacher_id: student.teacher_id },
      { onConflict: 'event_id' },
    )
    if (linkError) throw new Error(`Could not link the recording to the student: ${linkError.message}`)

    // The draft belongs in the TEACHER's queue, not the admin's — the store
    // namespaces docs per teacher and this session is not theirs.
    await runAsTeacher(student.teacher_id, async () => {
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
      done: true,
      eventId,
      student: student.full_name,
      teacherId: student.teacher_id,
      language: code ?? null,
      studentTalkPct: t.studentTalkPct,
      speakers: t.talk.map((s) => s.name),
      title: recap.title ?? null,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Failed to rebuild the recap.' }, { status: 500 })
  }
}
