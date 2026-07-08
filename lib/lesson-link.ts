/**
 * Links a Google calendar event (the teacher-tool world: Recall bots, recaps in
 * KV, keyed by eventId) to a Supabase student — so recording a lesson can open
 * that student's live doc, and a published recap lands on their record.
 *
 * Match order: the portal booking for the event, then attendee email.
 */
type Admin = { from: (t: string) => any }

export interface LinkedStudent { studentId: string; teacherId: string; fullName: string; email: string | null }

export async function mapEventToStudent(admin: Admin, eventId: string, attendeeEmails: string[] = [], teacherId?: string): Promise<LinkedStudent | null> {
  let studentId: string | null = null

  // 1. Explicit manual link set by the teacher wins.
  const { data: link } = await admin.from('lesson_event_links').select('student_id').eq('event_id', eventId).maybeSingle()
  if (link?.student_id) studentId = link.student_id

  // 2. Portal booking for this event.
  if (!studentId) {
    const { data: booking } = await admin.from('bookings').select('student_id').eq('google_event_id', eventId).maybeSingle()
    if (booking?.student_id) studentId = booking.student_id
  }

  if (!studentId && attendeeEmails.length) {
    const emails = attendeeEmails.map((e) => e.toLowerCase())
    // Scope by teacher so two teachers with a same-email student don't cross-match.
    let q = admin.from('students').select('id').in('email', emails)
    if (teacherId) q = q.eq('teacher_id', teacherId)
    const { data: s } = await q.limit(1).maybeSingle()
    if (s?.id) studentId = s.id
  }
  if (!studentId) return null

  const { data: st } = await admin.from('students').select('id, teacher_id, full_name, email').eq('id', studentId).single()
  if (!st) return null
  return { studentId: st.id, teacherId: st.teacher_id, fullName: st.full_name, email: st.email }
}
