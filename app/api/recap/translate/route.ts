import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentUser } from '@/lib/auth'
import { translateRecap } from '@/lib/openai'
import { getRecaps, saveRecap } from '@/lib/store'

export const dynamic = 'force-dynamic'
// One long completion over a full recap — the default 60s can be tight.
export const maxDuration = 300

/**
 * Translate an existing draft's explanations into the student's language.
 *
 * This is the retroactive path: recaps generated before the teacher set an
 * instruction language (or before the feature existed) get their explanatory
 * prose re-rendered without touching the recording, the metrics, or the
 * target-language material. The result lands back on the same event id as a
 * draft, so the review page simply reloads with it.
 *
 * The language comes from students.instruction_language; a `language` in the
 * body overrides it, which is how the review page offers a one-off translate
 * when the student has no setting yet.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { eventId, language } = await req.json().catch(() => ({}))
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })

  const all = await getRecaps()
  const rec = all[eventId]
  if (!rec?.recap) return NextResponse.json({ ok: false, error: 'No recap to translate.' }, { status: 404 })

  // The student the recap belongs to — their settings say what to translate
  // into and which language's material must be left alone.
  const admin = createAdminClient()
  const { data: link } = await admin
    .from('lesson_event_links')
    .select('student_id, teacher_id')
    .eq('event_id', eventId)
    .maybeSingle()
  if (!link) return NextResponse.json({ ok: false, error: 'No student is linked to this recap.' }, { status: 404 })
  if (link.teacher_id !== user.id) return NextResponse.json({ ok: false, error: 'Not your recap.' }, { status: 403 })

  const { data: student } = await admin
    .from('students').select('language, instruction_language').eq('id', link.student_id).single()

  const native = String(language ?? student?.instruction_language ?? '').trim().slice(0, 40)
  if (!native) {
    // The review page reads this as "ask the teacher which language".
    return NextResponse.json({ ok: false, needLanguage: true, error: 'No explanation language is set for this student.' }, { status: 400 })
  }

  try {
    const translated = await translateRecap(rec.recap, { native, target: student?.language })
    await saveRecap({ ...rec, recap: translated })
    return NextResponse.json({ ok: true, language: native })
  } catch (e: any) {
    console.error('recap translation failed', e?.message || e)
    return NextResponse.json({ ok: false, error: e?.message ?? 'Translation failed.' }, { status: 500 })
  }
}
