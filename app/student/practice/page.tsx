import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { DECKS, isDeckId, isDue, masteryOf, orderForPractice, SESSION_SIZE } from '@/lib/flashcards'
import PracticeDeck from '@/components/portal/PracticeDeck'

export const dynamic = 'force-dynamic'

/**
 * A practice session over the student's own vocabulary.
 *
 * Narrowed two ways, because students ask for both: `?deck=` is a part of
 * speech, `?lesson=` is one lesson's words — "the ones from last Tuesday" is
 * how people actually think about what they need to revise. Neither means the
 * whole collection.
 *
 * Cards that are due come first: a session should start with the words about
 * to be forgotten, not the ones already solid.
 */
export default async function PracticePage({
  searchParams,
}: {
  searchParams: { deck?: string; lesson?: string }
}) {
  const supabase = await createClient()
  const user = await requireUser(supabase, '/student/practice')

  const { data: student } = await supabase
    .from('students').select('id, full_name').eq('profile_id', user.id).maybeSingle()
  if (!student) redirect('/student/dashboard')

  const deckId = isDeckId(searchParams?.deck) ? searchParams.deck : null
  const deck = deckId ? DECKS.find((d) => d.id === deckId) : null
  const lessonId = typeof searchParams?.lesson === 'string' ? searchParams.lesson : null

  // RLS keeps this to the student's own published lessons.
  const { data: rows } = await supabase
    .from('vocabulary_items')
    .select('id, word, reading, definition, explanation, example_sentence, jlpt_level, part_of_speech, lesson_id, lessons!inner ( lesson_number, title )')
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
    .filter((r: any) => (lessonId ? r.lesson_id === lessonId : true))
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

  // Due first, least-known first within that. The deck hands these out a round
  // at a time — see SESSION_SIZE.
  const cards = orderForPractice(all)
  const dueCount = all.filter((c) => c.due).length

  /** Where this selection stands, for the panel above the first card. */
  const mastery = { known: 0, learning: 0, new: 0 }
  for (const c of all) {
    mastery[masteryOf(byItem.has(c.id) ? c.box : undefined)]++
  }

  // The title says what was picked, so a student who followed a link from the
  // dashboard knows which pile they are looking at.
  const first: any = rows?.find((r: any) => r.lesson_id === lessonId)
  const lessonMeta = Array.isArray(first?.lessons) ? first.lessons[0] : first?.lessons
  const title = lessonId
    ? (lessonMeta?.title || `Lesson ${lessonMeta?.lesson_number ?? ''}`.trim())
    : deck
      ? deck.label
      : 'All your words'

  return (
    <div style={{ maxWidth: 720 }}>
      <Link href="/student/dashboard" className="k-back">← Dashboard</Link>
      <PracticeDeck
        cards={cards}
        dueCount={dueCount}
        mastery={mastery}
        sessionSize={SESSION_SIZE}
        title={title}
        deck={deckId}
        lessonId={lessonId}
      />
    </div>
  )
}
