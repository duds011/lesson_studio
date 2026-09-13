import type { PartOfSpeech } from '@/lib/openai'

/**
 * The practice decks, and how a card is remembered between sessions.
 *
 * Decks come straight from the part of speech the recap records — nothing is
 * inferred here. A deck with no cards is never shown, which is what keeps a
 * new student from opening the dashboard onto six empty boxes.
 */
export const DECKS: { id: PartOfSpeech; label: string; sub: string; tone: string }[] = [
  { id: 'noun', label: 'Nouns', sub: 'things and places', tone: 'blue' },
  { id: 'verb', label: 'Verbs', sub: 'actions', tone: 'green' },
  { id: 'adjective', label: 'Adjectives', sub: 'describing words', tone: 'amber' },
  { id: 'adverb', label: 'Adverbs', sub: 'how and when', tone: 'teal' },
  { id: 'phrase', label: 'Phrases', sub: 'whole expressions', tone: 'purple' },
  { id: 'other', label: 'Everything else', sub: 'grammar and the rest', tone: 'slate' },
]

export const DECK_IDS = DECKS.map((d) => d.id)
export const isDeckId = (v: unknown): v is PartOfSpeech =>
  typeof v === 'string' && (DECK_IDS as string[]).includes(v)

/**
 * Leitner-lite. A card answered correctly climbs a box and comes back later;
 * a card missed drops to the bottom and comes back the same day.
 *
 * Days, by box. Five boxes is enough spacing for vocabulary a student also
 * meets in lessons — this is practice between lessons, not a memory system
 * anyone has to tend.
 */
export const BOX_DAYS = [0, 1, 3, 7, 21] as const
export const TOP_BOX = BOX_DAYS.length - 1

export function nextBox(box: number, knew: boolean): number {
  if (!knew) return 0
  return Math.min(TOP_BOX, Math.max(0, box) + 1)
}

export function dueAfter(box: number, from = new Date()): Date {
  const days = BOX_DAYS[Math.min(TOP_BOX, Math.max(0, box))]
  const d = new Date(from)
  // Due at the start of that day, not the same clock time: a student who
  // practised at 9pm should not have to wait until 9pm to see the card again.
  d.setDate(d.getDate() + days)
  if (days > 0) d.setHours(0, 0, 0, 0)
  return d
}

/** A card is worth showing when it has never been seen, or is due. */
export function isDue(review: { due_at?: string | null } | undefined, now = Date.now()): boolean {
  if (!review?.due_at) return true
  return Date.parse(review.due_at) <= now
}

/**
 * How many cards one sitting is.
 *
 * A student a term in has a hundred-odd words, and nobody sits down to a
 * hundred flashcards: they start, flag somewhere around thirty, and stop coming
 * back. Practice is worth far more little and often than once and never, so a
 * session is a short round that can be finished, and the next one is offered
 * rather than imposed.
 *
 * Twelve is about two minutes — the length of a queue or a kettle.
 */
export const SESSION_SIZE = 12

/**
 * The lengths a student can choose before starting.
 *
 * Twelve is the default because it is the one most people will finish. The
 * others exist because a fixed round is a floor, not a cage: someone with an
 * exam on Friday should be able to sit down to the lot, and `0` means exactly
 * that — everything that is waiting.
 */
export const SESSION_SIZES = [12, 25, 0] as const
export const sessionLabel = (n: number) => (n === 0 ? 'Everything' : String(n))

/**
 * How well a card is known, from its Leitner box.
 *
 * Three bands, not five: the boxes are a scheduling detail, and a student
 * wants to know whether a word is new to them, coming along, or theirs. Box 3
 * is a week between sightings, which is where "known" starts to mean it.
 */
export type Mastery = 'new' | 'learning' | 'known'

export function masteryOf(box: number | undefined): Mastery {
  if (box === undefined) return 'new'
  return box >= 3 ? 'known' : 'learning'
}

export const MASTERY_META: Record<Mastery, { label: string; tone: string; note: string }> = {
  known: { label: 'Known', tone: '#1c7f52', note: 'a week or more between sightings' },
  learning: { label: 'Learning', tone: '#0a61c9', note: 'coming back every few days' },
  new: { label: 'Not started', tone: '#c8ccd2', note: 'never practised' },
}

/**
 * Order a deck for practice: due first, least-known first within that, so a
 * short round spends its time where the forgetting is.
 *
 * Ties break on the id rather than on input order, so the rounds of one deck
 * partition it the same way every time instead of reshuffling around a card
 * the student has already seen today.
 */
export function orderForPractice<T extends { box: number; due: boolean; id: string }>(cards: T[]): T[] {
  return [...cards].sort((a, b) => {
    if (a.due !== b.due) return a.due ? -1 : 1
    if (a.box !== b.box) return a.box - b.box
    return a.id < b.id ? -1 : 1
  })
}
