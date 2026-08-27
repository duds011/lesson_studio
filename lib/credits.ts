/**
 * Lesson-credit math: purchased (Σ paid payments' lessons_covered) − used
 * (published lessons) = remaining. `low` flags an approaching last lesson.
 *
 * "Used" counts published lessons, not bookings. A booking is an intention —
 * it can move, or never happen — whereas a published recap is evidence a lesson
 * was actually taught, which is what a prepaid lesson pays for. It also means
 * the balance works for teachers who never touch the booking page, which is
 * most of them: they record a lesson, approve the recap, the count goes down.
 *
 * Pass a client with the right visibility:
 *  - teacher pages → the teacher's server client (RLS allows their rows)
 *  - student dashboard → the admin client (payments are teacher-only; the
 *    student only ever sees the resulting count, never payment details)
 */
type Client = { from: (t: string) => any }

export const LOW_THRESHOLD = 2

/** Only a published lesson has reached the student, so only it spends a credit. */
const SPENT_STATUS = 'published'

export type Credits = { purchased: number; used: number; remaining: number; low: boolean }

function toCredits(purchased: number, used: number): Credits {
  const remaining = purchased - used
  // Only flag "low" once the student actually has a package/usage — a brand-new
  // student with nothing recorded should not read as "out of lessons".
  const hasActivity = purchased > 0 || used > 0
  return { purchased, used, remaining, low: hasActivity && remaining <= LOW_THRESHOLD }
}

export async function getStudentCredits(client: Client, studentId: string): Promise<Credits> {
  const [{ data: pays }, { data: taught }] = await Promise.all([
    client.from('payments').select('lessons_covered').eq('student_id', studentId).eq('status', 'paid'),
    client.from('lessons').select('id').eq('student_id', studentId).eq('status', SPENT_STATUS),
  ])
  const purchased = (pays ?? []).reduce((s: number, p: any) => s + (p.lessons_covered ?? 0), 0)
  return toCredits(purchased, (taught ?? []).length)
}

/** Batch version for the teacher dashboard/payments table (avoids N+1). */
export async function getCreditsByStudent(client: Client, teacherId: string): Promise<Map<string, Credits>> {
  const [{ data: pays }, { data: taught }] = await Promise.all([
    client.from('payments').select('student_id, lessons_covered').eq('teacher_id', teacherId).eq('status', 'paid'),
    client.from('lessons').select('student_id').eq('teacher_id', teacherId).eq('status', SPENT_STATUS),
  ])
  const purchased = new Map<string, number>()
  const used = new Map<string, number>()
  for (const p of (pays ?? []) as any[]) if (p.student_id) purchased.set(p.student_id, (purchased.get(p.student_id) ?? 0) + (p.lessons_covered ?? 0))
  for (const l of (taught ?? []) as any[]) if (l.student_id) used.set(l.student_id, (used.get(l.student_id) ?? 0) + 1)

  const ids = new Set<string>()
  purchased.forEach((_v, k) => ids.add(k))
  used.forEach((_v, k) => ids.add(k))

  const out = new Map<string, Credits>()
  ids.forEach((id) => out.set(id, toCredits(purchased.get(id) ?? 0, used.get(id) ?? 0)))
  return out
}
