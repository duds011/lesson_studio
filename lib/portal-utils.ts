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

// Playful "level" label unlocked by lesson count — mirrors the milestone track.
export function getLevelLabel(lessonCount: number): string {
  if (lessonCount >= 50) return 'Master'
  if (lessonCount >= 25) return 'Advanced'
  if (lessonCount >= 10) return 'Committed'
  if (lessonCount >= 5) return 'Blooming'
  return 'Sprouting'
}
