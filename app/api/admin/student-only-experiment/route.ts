import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assembleTracks, type TrackWords } from '@/lib/whisper'
import { normalizeSegments } from '@/lib/transcript'
import { generateRecap } from '@/lib/openai'
import { RECORDING_BUCKET, transcriptPath, type CachedTranscript } from '@/lib/ext-storage'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * EXPERIMENT — can a recap survive on the student's track alone?
 *
 * The standalone student product would halve transcription cost by recording
 * only the student's own microphone. Before building anything on that bet,
 * this rebuilds an existing lesson's recap from its cached transcript with
 * the teacher's track REMOVED, and returns the result for a side-by-side
 * against the full recap. Nothing is saved and nothing is billed except the
 * one completion; cache only — it never re-transcribes audio.
 *
 * Gated like the cron: Authorization: Bearer CRON_SECRET. Temporary tooling,
 * expected to be deleted once the question is answered.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  const header = req.headers.get('authorization') || ''
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { eventId, studentTrack = 'tab' } = await req.json().catch(() => ({}))
  const recordingId = String(eventId ?? '').startsWith('ext:') ? String(eventId).slice(4) : ''
  if (!recordingId) return NextResponse.json({ ok: false, error: 'Missing ext: eventId' }, { status: 400 })
  if (studentTrack !== 'tab' && studentTrack !== 'mic') {
    return NextResponse.json({ ok: false, error: 'studentTrack must be tab or mic' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: link } = await admin
    .from('lesson_event_links').select('student_id, teacher_id').eq('event_id', eventId).maybeSingle()
  if (!link) return NextResponse.json({ ok: false, error: 'No student linked.' }, { status: 404 })
  const { data: student } = await admin
    .from('students').select('full_name, language, instruction_language, jp_script').eq('id', link.student_id).single()
  if (!student) return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 })

  const cached = await admin.storage.from(RECORDING_BUCKET).download(transcriptPath(recordingId))
  if (!cached.data) return NextResponse.json({ ok: false, error: 'No cached transcript for this recording.' }, { status: 404 })
  const parsed = JSON.parse(await cached.data.text()) as CachedTranscript
  const words = parsed?.tracks?.[studentTrack]
  if (!parsed || parsed.v !== 1 || !Array.isArray(words) || !words.length) {
    return NextResponse.json({ ok: false, error: `No usable ${studentTrack} track in the cache.` }, { status: 422 })
  }

  const oneTrack: TrackWords[] = [{ speaker: student.full_name, isHost: false, words }]
  const t = normalizeSegments(assembleTracks(oneTrack).filtered)
  if (!t.plain.trim()) return NextResponse.json({ ok: false, error: 'Student track is empty.' }, { status: 422 })

  const recap: any = await generateRecap({
    studentName: student.full_name,
    transcript: t.plain,
    language: student.language || undefined,
    instructionLanguage: (student as any).instruction_language,
    script: (student as any).jp_script,
  })

  return NextResponse.json({
    ok: true,
    transcriptChars: t.plain.length,
    recap,
  })
}
