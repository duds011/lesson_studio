import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { attachLessonAudio, type Wanted } from '@/lib/lesson-audio'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// Two tracks transcribed once more each, then a clip cut and checked per
// phrase. A 50-minute lesson takes most of five minutes.
export const maxDuration = 800

/**
 * Cut the lesson's vocabulary and corrections out of the recording.
 *
 * A route of its own rather than a step inside /api/recap/build, and the
 * reason is the 80MB ffmpeg binary: bundled into the build path it would sit
 * in the cold start of the request a teacher is watching a spinner for. Here
 * it is carried by a function nobody waits for.
 *
 * Callable by the teacher who owns the lesson, or by the server itself with
 * the service-role key — which is how the build triggers it without any new
 * configuration.
 */
export async function POST(req: Request) {
  const { lessonId, redo } = await req.json().catch(() => ({}))
  if (typeof lessonId !== 'string' || !lessonId) {
    return NextResponse.json({ ok: false, error: 'Missing lessonId' }, { status: 400 })
  }

  const secret = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  const internal = Boolean(secret) && req.headers.get('authorization') === `Bearer ${secret}`

  const admin = createAdminClient()
  const { data: lesson } = await admin
    .from('lessons').select('id, teacher_id, student_id, source_event_id')
    .eq('id', lessonId).maybeSingle()
  if (!lesson) return NextResponse.json({ ok: false, error: 'No such lesson' }, { status: 404 })

  if (!internal) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'Not signed in' }, { status: 401 })
    if (lesson.teacher_id !== user.id) {
      return NextResponse.json({ ok: false, error: 'Not your lesson' }, { status: 404 })
    }
  }

  const eventId = String(lesson.source_event_id ?? '')
  if (!eventId.startsWith('ext:')) {
    return NextResponse.json({ ok: false, error: 'This lesson has no stored recording.' }, { status: 400 })
  }

  try {
    const [{ data: student }, { data: link }, { data: vocab }, { data: summary }] = await Promise.all([
      admin.from('students').select('language').eq('id', lesson.student_id).maybeSingle(),
      admin.from('lesson_event_links').select('mic_is').eq('event_id', eventId).maybeSingle(),
      admin.from('vocabulary_items').select('id, word').eq('lesson_id', lessonId).order('sort_order'),
      admin.from('lesson_summaries').select('recap_json').eq('lesson_id', lessonId).maybeSingle(),
    ])

    const corrections: any[] = ((summary?.recap_json as any)?.corrections ?? []) as any[]
    const wanted: Wanted[] = [
      ...((vocab ?? []) as any[]).map((v) => ({
        kind: 'vocab' as const, key: String(v.id), phrase: String(v.word), prefer: 'teacher' as const,
      })),
      ...corrections.flatMap((c, i) => {
        const said = String(c.said ?? '').trim()
        const fixed = String(c.correction ?? '').trim()
        const out: Wanted[] = []
        if (said) out.push({ kind: 'said', key: String(i), phrase: said, prefer: 'student' })
        if (fixed) out.push({ kind: 'fixed', key: String(i), phrase: fixed, prefer: 'teacher' })
        return out
      }),
    ]
    if (!wanted.length) return NextResponse.json({ ok: true, made: 0, missed: [] })

    const res = await attachLessonAudio(admin, {
      recordingId: eventId.slice(4),
      language: String(student?.language ?? 'English'),
      // mic_is is the stored answer; both tracks are searched either way, and
      // the clip is filed under whichever voice actually said it.
      teacherTrack: (link as any)?.mic_is === 'teacher' ? 'mic' : 'tab',
      wanted,
      redo: redo === true,
    })
    return NextResponse.json({ ok: true, made: res.made.length, missed: res.missed.length })
  } catch (e: any) {
    // Never fatal to anything upstream: a lesson whose words cannot be played
    // is still a lesson, and this belongs in the logs rather than in front of
    // a teacher who did not ask for it.
    console.error('lesson audio failed:', e?.message || e)
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
