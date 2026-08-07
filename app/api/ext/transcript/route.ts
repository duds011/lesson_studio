import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticateExtension } from '@/lib/ext-auth'
import { transcribeTracksDetailed, renderLines, toWhisperLanguage } from '@/lib/whisper'
import { normalizeSegments } from '@/lib/transcript'
import { RECORDING_BUCKET, trackPath } from '@/lib/ext-storage'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Read back what was actually heard on an uploaded recording.
 *
 * Diagnostic, not part of the recap flow: when a recap looks wrong there is no
 * way to tell a bad transcript from an over-eager echo filter without seeing
 * each track on its own and the merged result side by side.
 */
export async function POST(req: Request) {
  const caller = await authenticateExtension(req)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recordingId, micIs, language } = await req.json().catch(() => ({}))
  if (!recordingId) return NextResponse.json({ error: 'Missing recordingId' }, { status: 400 })

  const admin = createAdminClient()
  const micIsTeacher = micIs !== 'student'
  const wanted = [
    { track: 'mic', speaker: micIsTeacher ? 'Teacher' : 'Student', isHost: micIsTeacher },
    { track: 'tab', speaker: micIsTeacher ? 'Student' : 'Teacher', isHost: !micIsTeacher },
  ]

  try {
    const tracks = []
    for (const w of wanted) {
      const { data, error } = await admin.storage.from(RECORDING_BUCKET).download(trackPath(recordingId, w.track))
      if (error || !data) return NextResponse.json({ error: `Missing ${w.track}: ${error?.message}` }, { status: 404 })
      tracks.push({ blob: data, speaker: `${w.speaker} (${w.track})`, isHost: w.isHost })
    }

    // The name has to become an ISO code first. Passed raw, Whisper rejected
    // "French" and this route silently diagnosed a transcript that had been
    // auto-detected — the opposite of what it is for.
    const code = toWhisperLanguage(language)
    const { perTrack, all, filtered } = await transcribeTracksDetailed(tracks, code)
    const t = normalizeSegments(filtered)

    return NextResponse.json({
      // What Whisper was actually told. Null means it guessed, which is the
      // first thing to check when a transcript comes back as gibberish.
      language: code ?? null,
      tracks: perTrack.map((p) => ({
        speaker: p.speaker,
        segments: p.segments.length,
        lines: renderLines(p.segments),
      })),
      droppedAsEcho: renderLines(all.filter((s) => !filtered.includes(s))),
      merged: renderLines(filtered),
      talk: t.talk,
      studentTalkPct: t.studentTalkPct,
      sentToModel: t.plain,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 })
  }
}
