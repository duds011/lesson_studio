import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { dueAfter, nextBox } from '@/lib/flashcards'

/**
 * Records one answer to one card.
 *
 * Called on every "Knew it" / "Again", so it is deliberately one small write.
 * The row is created on first answer rather than seeded for every word a
 * student has ever met — an untouched deck should cost nothing.
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { vocabularyItemId, knew } = await req.json()
  if (typeof vocabularyItemId !== 'string' || typeof knew !== 'boolean') {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: student } = await admin
    .from('students').select('id').eq('profile_id', user.id).maybeSingle()
  if (!student) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // The card has to be one of this student's own words — otherwise any id
  // would let someone write rows against vocabulary they have never met.
  const { data: item } = await admin
    .from('vocabulary_items')
    .select('id, lessons!inner ( student_id )')
    .eq('id', vocabularyItemId)
    .maybeSingle()
  const lesson: any = Array.isArray((item as any)?.lessons) ? (item as any).lessons[0] : (item as any)?.lessons
  if (!item || lesson?.student_id !== student.id) {
    return NextResponse.json({ error: 'Not your card' }, { status: 403 })
  }

  const { data: prev } = await admin
    .from('flashcard_reviews')
    .select('box, reviews, lapses')
    .eq('student_id', student.id).eq('vocabulary_item_id', vocabularyItemId)
    .maybeSingle()

  const box = nextBox(prev?.box ?? 0, knew)
  const now = new Date()
  const { error } = await admin.from('flashcard_reviews').upsert({
    student_id: student.id,
    vocabulary_item_id: vocabularyItemId,
    box,
    reviews: (prev?.reviews ?? 0) + 1,
    lapses: (prev?.lapses ?? 0) + (knew ? 0 : 1),
    last_reviewed_at: now.toISOString(),
    due_at: dueAfter(box, now).toISOString(),
  }, { onConflict: 'student_id,vocabulary_item_id' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, box })
}
