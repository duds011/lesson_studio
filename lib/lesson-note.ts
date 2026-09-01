/**
 * The teacher's private one-liner about a lesson, written from its recap.
 *
 * Teachers were opening the student's recap to remember what happened last
 * time — a document written for the student, read by the teacher, answering
 * the question the Notes tab exists for. The tab stayed empty because filling
 * it is a second write-up after the lesson is already over.
 *
 * Two things this deliberately does NOT do:
 *
 * 1. No model call. The recap's sections are already ordered — what they DID
 *    first, then the language points that came out of it — so the note is
 *    assembled from those titles verbatim. A note a teacher trusts on the way
 *    into a lesson must not be able to describe a lesson that never happened.
 *
 * 2. No labels, in any language. An earlier version wrote "やったこと:" /
 *    "Covered:" around the topics and then had to decide which language the
 *    teacher reads. There is nothing to translate now: every word in the note
 *    comes from the recap, which is already in the right language for whoever
 *    is reading it. The Notes grid supplies the student and the date, so the
 *    note does not repeat those either.
 */

/** "3. 仮定法と現在形" -> "仮定法と現在形". The numbering belongs to the recap. */
function clean(title: unknown): string {
  return String(title ?? '').replace(/^\s*\d+\s*[.、）)]\s*/, '').trim()
}

/** Long titles are trimmed on a word boundary where there is one to find. */
function clip(s: string, max: number): string {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const sp = cut.lastIndexOf(' ')
  return `${(sp > max * 0.6 ? cut.slice(0, sp) : cut).trimEnd()}…`
}

/** How many of the opening sections to name. They are the lesson's activities. */
const TOPICS = 3
const TOPIC_MAX = 46

/**
 * Returns the note text, or '' when the recap has nothing worth saying — an
 * empty note is worse than no note, because the grid would show a filled cell
 * that answers nothing.
 */
export function noteFromRecap(recap: any, fallbackTitle?: string | null): string {
  if (!recap || typeof recap !== 'object') return ''

  const title = clean(recap.lesson_title) || clean(fallbackTitle)
  const sections: any[] = Array.isArray(recap.sections) ? recap.sections : []
  const topics = sections
    .map((s) => clean(s?.title))
    .filter(Boolean)
    .slice(0, TOPICS)
    .map((t) => clip(t, TOPIC_MAX))

  const lines = []
  if (title) lines.push(clip(title, 80))
  // Skipped when the only topic would restate the title — which is what a
  // one-section recap produces.
  if (topics.length && !(topics.length === 1 && topics[0] === title)) {
    lines.push(topics.join(' · '))
  }
  return lines.join('\n')
}
