// Small formatting helpers for the student/teacher portal views.

export function formatDateShort(date?: string | null): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Clean, student-facing lesson title. Prefers the AI-generated lesson_title,
// then derives one from the recap's section topics (calendar event names like
// "7:8 Derek Hui and Noa" are not useful to students), then falls back.
export function lessonDisplayTitle(recapJson: any, rawTitle?: string | null, lessonNumber?: number | null): string {
  const ai = typeof recapJson?.lesson_title === 'string' ? recapJson.lesson_title.trim() : ''
  if (ai) return ai

  const sections: any[] = Array.isArray(recapJson?.sections) ? recapJson.sections : []
  const topics = sections
    .map((s) => String(s?.title ?? ''))
    .filter((t) => !/main corrections|refinement|takeaway/i.test(t))
    .map((t) => {
      // "1. 方法を考える: Considering Solutions" → "Considering Solutions"
      const en = t.split(':').pop()?.trim() ?? ''
      return en.replace(/^\d+\.\s*/, '')
    })
    .filter(Boolean)
  if (topics.length >= 2) return `${topics[0]} & ${topics[1]}`
  if (topics.length === 1) return topics[0]

  if (rawTitle) return rawTitle
  return lessonNumber != null ? `Lesson ${lessonNumber}` : 'Lesson'
}

// One quiet line under a lesson title: what the lesson was about, from the
// recap overview (or the first section), cut at a word boundary.
export function lessonBlurb(recapJson: any, max = 110): string {
  const raw =
    (typeof recapJson?.recap === 'string' && recapJson.recap.trim()) ||
    (Array.isArray(recapJson?.sections) && typeof recapJson.sections[0]?.body === 'string'
      ? recapJson.sections[0].body.trim()
      : '')
  if (!raw) return ''
  if (raw.length <= max) return raw
  const cut = raw.slice(0, max)
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 60))}…`
}

// Playful "level" label unlocked by lesson count — mirrors the milestone track.
export function getLevelLabel(lessonCount: number): string {
  if (lessonCount >= 50) return 'Master'
  if (lessonCount >= 25) return 'Advanced'
  if (lessonCount >= 10) return 'Committed'
  if (lessonCount >= 5) return 'Blooming'
  return 'Sprouting'
}

/**
 * Homework as an editable list of strings, whatever shape the model produced.
 *
 * A recap's homework is meant to be `[{ description }]`, but the JSON is
 * written by a language model and it sometimes comes back as a single string.
 * That used to be fatal rather than untidy: every render site guarded with
 * `homework?.length > 0`, a string has a length, and the `.map` that followed
 * threw and took the page down with it.
 */
export function asHomework(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((h: any) => (typeof h === 'string' ? h : h?.description || '')).filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}
