import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Logs one finished round of practice.
 *
 * Separate from the per-card route on purpose: that one fires on every answer
 * and must stay as small as possible, while this fires once and is the only
 * thing that can say a round happened on a given day.
 *
 * A round that is abandoned halfway is not logged. Practice history should
 * count the times someone finished what they sat down to do — a log padded
 * with everything anyone ever started would make the streak meaningless.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { cards, correct, deck, lessonId } = await req.json().catch(() => ({}))
  if (typeof cards !== 'number' || typeof correct !== 'number') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  // The client reports these, so they are a claim rather than a measurement:
  // clamp them into a shape the history can be drawn from whatever arrives.
  const n = Math.max(1, Math.min(500, Math.round(cards)))
  const got = Math.max(0, Math.min(n, Math.round(correct)))

  const admin = createAdminClient()
  const { data: student } = await admin
    .from('students').select('id').eq('profile_id', user.id).maybeSingle()
  if (!student) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // A lesson id is only recorded when it is one of this student's own.
  let lesson: string | null = null
  if (typeof lessonId === 'string' && lessonId) {
    const { data: owned } = await admin
      .from('lessons').select('id').eq('id', lessonId).eq('student_id', student.id).maybeSingle()
    lesson = owned?.id ?? null
  }

  const { error } = await admin.from('flashcard_sessions').insert({
    student_id: student.id,
    deck: typeof deck === 'string' && deck ? deck.slice(0, 24) : null,
    lesson_id: lesson,
    cards: n,
    correct: got,
  })
  // The round itself already counted — every card was written as it was
  // answered. Losing the log entry costs a bar on a chart, so it is not worth
  // showing the student an error about.
  if (error) {
    console.error('flashcard session log failed:', error.message)
    return NextResponse.json({ ok: false })
  }

  return NextResponse.json({ ok: true })
}
