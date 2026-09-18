/**
 * What a learner can say went wrong with a write-up.
 *
 * A closed list rather than a star rating, because a number is not actionable:
 * twenty recaps averaging 4.2 tells you nothing you can fix, and the average
 * moves so slowly that a regression hides inside it for weeks.
 *
 * Every option here maps to a specific failure this pipeline actually has, so
 * a complaint arrives already sorted into the code that caused it:
 *
 *  - `words`    → transcription. Whisper inventing speech over silence, or
 *                 mangling the target language because it was told the
 *                 learner's native one.
 *  - `speakers` → track orientation. This is the one that would have caught
 *                 the inverted French lessons in August the same week rather
 *                 than a month later: the recap grading the teacher's speech
 *                 as the student's looks, to the person reading it, exactly
 *                 like "you mixed up who said what".
 *  - `script`   → the script profile and the language prompts — bare kana with
 *                 no reading, romaji rendered as prose, explanations in the
 *                 wrong language.
 *  - `level`    → the CEFR/JLPT banding and vocabulary selection.
 *  - `other`    → the free-text box, which is where anything not yet on this
 *                 list gets discovered.
 *
 * Kept identical in Lesson Journal so the two products' answers can be counted
 * together. If one gains a reason, so does the other.
 */
export const RATING_REASONS = [
  { key: 'words', label: 'Words I never said' },
  { key: 'speakers', label: 'Mixed up who said what' },
  { key: 'script', label: 'Wrong script or language' },
  { key: 'level', label: 'Too easy or too hard for me' },
  { key: 'other', label: 'Something else' },
] as const

export type RatingReason = (typeof RATING_REASONS)[number]['key']

const KEYS = new Set<string>(RATING_REASONS.map((r) => r.key))

/** Only reasons we know about, deduped, so a crafted POST cannot fill the column. */
export function cleanReasons(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  for (const r of raw) {
    const k = String(r ?? '').trim()
    if (KEYS.has(k) && !out.includes(k)) out.push(k)
  }
  return out
}

/** Free text is a sentence, not an essay, and never a NUL that breaks the insert. */
export function cleanNote(raw: unknown): string | null {
  const s = String(raw ?? '').replace(/\u0000/g, '').trim().slice(0, 600)
  return s || null
}

export function reasonLabel(key: string): string {
  return RATING_REASONS.find((r) => r.key === key)?.label ?? key
}
