import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { DECKS, isDeckId, isDue, orderForPractice, SESSION_SIZE } from '@/lib/flashcards'
import PracticeDeck from '@/components/portal/PracticeDeck'

export const dynamic = 'force-dynamic'

/**
 * A practice session over the student's own vocabulary.
 *
 * `?deck=` narrows to one part of speech; without it the session is every card
 * they have. Cards that are due come first — a session should start with the
 * words about to be forgotten, not the ones already solid.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: { deck?: string }
}) {
  const supabase = await createClient()
  const user = await requireUser(supabase, '/student/practice')

  const { data: student } = await supabase
    .from('students').select('id, full_name').eq('profile_id', user.id).maybeSingle()
  if (!student) redirect('/student/dashboard')

  const deckId = isDeckId(searchParams?.deck) ? searchParams.deck : null
  const deck = deckId ? DECKS.find((d) => d.id === deckId) : null

  // RLS keeps this to the student's own published lessons.
  const { data: rows } = await supabase
    .from('vocabulary_items')
    .select('id, word, reading, definition, explanation, example_sentence, jlpt_level, part_of_speech, lessons!inner ( lesson_number )')
    .eq('is_key', true)
    .order('sort_order', { ascending: true })

  const { data: reviews } = await supabase
    .from('flashcard_reviews')
    .select('vocabulary_item_id, box, due_at')
    .eq('student_id', student.id)

  const byItem = new Map((reviews ?? []).map((r: any) => [r.vocabulary_item_id, r]))

  const all = (rows ?? [])
    // Untagged words belong to no deck in particular, so they answer to
    // "everything else" rather than disappearing from practice entirely.
    .filter((r: any) => (deckId ? (isDeckId(r.part_of_speech) ? r.part_of_speech : 'other') === deckId : true))
    .map((r: any) => {
      const rev = byItem.get(r.id)
      return {
        id: r.id,
        word: r.word,
        reading: r.reading,
        definition: r.definition,
        example: r.example_sentence,
        level: r.jlpt_level,
        pos: r.part_of_speech,
        lesson: (Array.isArray(r.lessons) ? r.lessons[0] : r.lessons)?.lesson_number ?? null,
        box: rev?.box ?? 0,
        due: isDue(rev),
      }
    })

  // Due first, least-known first within that. The deck then hands these out a
  // round at a time — see SESSION_SIZE.
  const cards = orderForPractice(all)
  const dueCount = all.filter((c) => c.due).length

  return (
    <div style={{ maxWidth: 720 }}>
      <Link href="/student/dashboard" className="k-back">← Dashboard</Link>
      <PracticeDeck
        cards={cards}
        dueCount={dueCount}
        sessionSize={SESSION_SIZE}
        title={deck ? deck.label : 'All your words'}
      />
    </div>
  )
}
