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

// Playful "level" label unlocked by lesson count — mirrors the milestone track.
export function getLevelLabel(lessonCount: number): string {
  if (lessonCount >= 50) return 'Master'
  if (lessonCount >= 25) return 'Advanced'
  if (lessonCount >= 10) return 'Committed'
  if (lessonCount >= 5) return 'Blooming'
  return 'Sprouting'
}
