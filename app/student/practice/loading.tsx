import Thinking from '@/components/portal/Thinking'

/**
 * The wait before a round of flashcards.
 *
 * /student/practice is `force-dynamic` and reads the whole vocabulary — every
 * card, its box and its due date — before it can order a single round. On a
 * phone, on a collection of a hundred-odd words, that is a visible pause, and
 * without a boundary here the router held the dashboard on screen for the whole
 * of it. Tapping a pile did nothing you could see, which reads as a dead button
 * rather than as a wait.
 */
export default function PracticeLoading() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: '16vh 0 0', minHeight: '44vh' }}>
      <Thinking size={64} label="Shuffling your cards…" />
    </div>
  )
}
