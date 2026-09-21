import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { RECORDING_BUCKET } from '@/lib/ext-storage'
import { clipPath, type ClipKind, type Voice } from '@/lib/lesson-audio'

export const dynamic = 'force-dynamic'

const KINDS: ClipKind[] = ['vocab', 'said', 'fixed']
const VOICES: Voice[] = ['teacher', 'student']

/**
 * One phrase from a lesson, in the voice it was said in.
 *
 * Proxied rather than handed out as a signed storage URL: the clip is a dozen
 * kilobytes, so there is nothing worth saving, and the recordings bucket stays
 * as private as it is everywhere else — no client policy, no link that outlives
 * the session that minted it.
 *
 * Both the student and their teacher may listen. 404 is the ordinary answer:
 * a phrase nobody said aloud has no clip, and neither does a lesson whose
 * audio has passed the 30-day purge.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const lessonId = url.searchParams.get('lesson') ?? ''
  const kind = url.searchParams.get('kind') as ClipKind
  const key = url.searchParams.get('key') ?? ''
  const voice = url.searchParams.get('voice') as Voice

  if (!lessonId || !key || !KINDS.includes(kind) || !VOICES.includes(voice)) {
    return new Response('Bad request', { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Not signed in', { status: 401 })

  const admin = createAdminClient()
  const { data: lesson } = await admin
    .from('lessons').select('teacher_id, student_id, source_event_id')
    .eq('id', lessonId).maybeSingle()
  if (!lesson) return new Response('Not found', { status: 404 })

  // The teacher who owns it, or the student it belongs to. Anyone else gets
  // the same 404 as a lesson that does not exist.
  let allowed = lesson.teacher_id === user.id
  if (!allowed) {
    const { data: student } = await admin
      .from('students').select('id').eq('id', lesson.student_id).eq('profile_id', user.id).maybeSingle()
    allowed = Boolean(student)
  }
  if (!allowed) return new Response('Not found', { status: 404 })

  const eventId = String(lesson.source_event_id ?? '')
  if (!eventId.startsWith('ext:')) return new Response('Not found', { status: 404 })

  const file = await admin.storage
    .from(RECORDING_BUCKET).download(clipPath(eventId.slice(4), kind, key, voice))
  if (!file.data) return new Response('Not found', { status: 404 })

  return new Response(await file.data.arrayBuffer(), {
    headers: {
      'Content-Type': 'audio/webm',
      // One person's lesson: private, and long enough that pressing play twice
      // costs one fetch.
      'Cache-Control': 'private, max-age=86400',
    },
  })
}
