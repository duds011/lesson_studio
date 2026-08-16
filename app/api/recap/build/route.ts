import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentUser } from '@/lib/auth'
import { transcribeTracks, assembleTracks, toWhisperLanguage, type TrackWords } from '@/lib/whisper'
import { normalizeSegments } from '@/lib/transcript'
import { generateRecap } from '@/lib/openai'
import { saveRecap } from '@/lib/store'
import { runAsTeacher } from '@/lib/teacher-scope'
import { checkRecapQuota, recordRecapRun } from '@/lib/recap-quota'
import { RECORDING_BUCKET, trackPath, transcriptPath, type CachedTranscript } from '@/lib/ext-storage'

export const dynamic = 'force-dynamic'
// Usually just one completion now, but a recording made before transcripts were
// cached still has to be heard again, and that is two round trips plus the
// completion — the default 60s is not close, and neither was 300s on a
// 52-minute lesson. Note "before transcripts were cached" covers every
// recording made until today: the cache write was rejected by the bucket's
// MIME allow-list and the error swallowed, so no rebuild has ever hit it.
export const maxDuration = 800

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

  // Before any paid work — transcription and the completion are both billed.
  const quota = await checkRecapQuota(link.teacher_id)
  if (!quota.ok) return NextResponse.json({ ok: false, error: quota.message }, { status: 429 })

  const { data: student } = await admin
    .from('students').select('id, full_name, language, instruction_language, jp_script').eq('id', link.student_id).single()
  if (!student) return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 })

  try {
    // Whoever held the mic decides which track is the host. Unspecified means
    // the teacher recorded, which is the recorder's own default.
    const micIsTeacher = micIs !== 'student'
    const wanted = [
      { track: 'mic', speaker: micIsTeacher ? 'Teacher' : student.full_name, isHost: micIsTeacher },
      { track: 'tab', speaker: micIsTeacher ? student.full_name : 'Teacher', isHost: !micIsTeacher },
    ]

    // The student's own language, not the teacher's: it is the field that says
    // what THIS student is being taught, and it picks the prompt.
    const language = student.language || undefined

    /**
     * The words first, the audio only if we have to.
     *
     * A rebuild exists to run an old lesson through a better prompt — the
     * transcription cannot improve, and it is ~85% of the cost. So the saved
     * words are used when they exist, and hearing the lesson again is the
     * fallback for recordings made before they were kept.
     */
    let segments: any[] | null = null
    let source: 'cache' | 'audio' = 'cache'

    const cached = await admin.storage.from(RECORDING_BUCKET).download(transcriptPath(recordingId))
    if (cached.data) {
      try {
        const parsed = JSON.parse(await cached.data.text()) as CachedTranscript
        if (parsed?.v === 1 && parsed.tracks) {
          // Speakers are reattached here, not read from the cache, so a rebuild
          // that corrects who was holding the mic still takes effect.
          const fromCache: TrackWords[] = wanted
            .filter((w) => Array.isArray(parsed.tracks[w.track]) && parsed.tracks[w.track].length)
            .map((w) => ({ speaker: w.speaker, isHost: w.isHost, words: parsed.tracks[w.track] }))
          if (fromCache.length) segments = assembleTracks(fromCache).filtered
        }
      } catch (e: any) {
        console.warn(`[recap/build] cached transcript unusable, re-transcribing: ${e?.message || e}`)
      }
    }

    if (!segments) {
      source = 'audio'
      const tracks = []
      for (const w of wanted) {
        const { data, error } = await admin.storage.from(RECORDING_BUCKET).download(trackPath(recordingId, w.track))
        if (error || !data) {
          return NextResponse.json({ ok: false, error: `The ${w.track} recording is no longer in storage.` }, { status: 404 })
        }
        if (data.size > 0) tracks.push({ blob: data, speaker: w.speaker, isHost: w.isHost })
      }
      if (!tracks.length) return NextResponse.json({ ok: false, error: 'Both tracks were empty.' }, { status: 422 })
      segments = await transcribeTracks(tracks, toWhisperLanguage(language))
    }

    const t = normalizeSegments(segments)
    if (!t.plain.trim()) return NextResponse.json({ ok: false, error: 'Nothing was said on either track.' }, { status: 422 })

    const recap: any = await generateRecap({
      studentName: student.full_name,
      transcript: t.plain,
      language,
      instructionLanguage: (student as any).instruction_language,
      script: (student as any).jp_script,
    })
    await recordRecapRun(link.teacher_id, 'rebuild')
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
      // Whether this rebuild paid to hear the lesson again, or reused the words.
      source,
    })
  } catch (e: any) {
    console.error('recap rebuild failed', e?.message || e)
    return NextResponse.json({ ok: false, error: e?.message || 'Rebuild failed.' }, { status: 500 })
  }
}
