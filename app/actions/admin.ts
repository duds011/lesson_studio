'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin'

type Result = { success: boolean; error?: string; warnings?: string[] }

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) return null
  return user
}

/**
 * Every relational trace of a set of lessons. Nothing here has ON DELETE
 * CASCADE (the schema predates it), so the order is by hand: children before
 * the lessons they hang off.
 */
async function deleteLessonTrees(admin: any, lessonIds: string[], warnings: string[]) {
  if (lessonIds.length === 0) return
  for (const table of ['vocabulary_items', 'lesson_summaries', 'lesson_attachments', 'student_audio_submissions']) {
    const { error } = await admin.from(table).delete().in('lesson_id', lessonIds)
    if (error) warnings.push(`${table}: ${error.message}`)
  }
}

/**
 * Delete a teacher and everything they own — students, lessons, recaps,
 * payments, tests, tokens, and the linked student sign-ins.
 *
 * Deliberately loud about partial failure: a delete that quietly leaves rows
 * behind is worse than one that reports what it could not remove.
 */
export async function adminDeleteTeacher(teacherId: string): Promise<Result> {
  const caller = await requireAdmin()
  if (!caller) return { success: false, error: 'Not authorized' }
  if (caller.id === teacherId) return { success: false, error: 'You cannot delete the account you are signed in with.' }

  const admin = createAdminClient()
  const warnings: string[] = []

  const [{ data: lessons }, { data: students }] = await Promise.all([
    admin.from('lessons').select('id').eq('teacher_id', teacherId),
    admin.from('students').select('id, profile_id').eq('teacher_id', teacherId),
  ])
  await deleteLessonTrees(admin, (lessons ?? []).map((l: any) => l.id), warnings)

  // tests first: test_attempts cascades off them.
  for (const table of ['tests', 'lessons', 'bookings', 'payments', 'lesson_packages', 'student_notes', 'lesson_event_links', 'teacher_ext_tokens']) {
    const { error } = await admin.from(table).delete().eq('teacher_id', teacherId)
    if (error) warnings.push(`${table}: ${error.message}`)
  }

  const { error: stuErr } = await admin.from('students').delete().eq('teacher_id', teacherId)
  if (stuErr) warnings.push(`students: ${stuErr.message}`)

  // The students' own sign-ins go with the teacher: a portal login whose
  // portal no longer exists is just a stranded credential.
  for (const s of (students ?? []) as any[]) {
    if (!s.profile_id) continue
    const { error } = await admin.from('profiles').delete().eq('id', s.profile_id)
    if (error) warnings.push(`student profile: ${error.message}`)
    const { error: authErr } = await admin.auth.admin.deleteUser(s.profile_id)
    if (authErr) warnings.push(`student auth: ${authErr.message}`)
  }

  const { error: profErr } = await admin.from('profiles').delete().eq('id', teacherId)
  if (profErr) warnings.push(`profile: ${profErr.message}`)
  const { error: authErr } = await admin.auth.admin.deleteUser(teacherId)
  if (authErr) warnings.push(`auth user: ${authErr.message}`)

  revalidatePath('/admin')
  return { success: true, warnings: warnings.length ? warnings : undefined }
}

/** Delete one student — their rows, their lessons' trees, and their sign-in. */
export async function adminDeleteStudent(studentId: string): Promise<Result> {
  const caller = await requireAdmin()
  if (!caller) return { success: false, error: 'Not authorized' }

  const admin = createAdminClient()
  const warnings: string[] = []

  const [{ data: student }, { data: lessons }] = await Promise.all([
    admin.from('students').select('id, profile_id').eq('id', studentId).maybeSingle(),
    admin.from('lessons').select('id').eq('student_id', studentId),
  ])
  if (!student) return { success: false, error: 'Student not found' }

  await deleteLessonTrees(admin, (lessons ?? []).map((l: any) => l.id), warnings)

  for (const table of ['tests', 'lessons', 'bookings', 'payments', 'student_notes', 'lesson_event_links']) {
    const { error } = await admin.from(table).delete().eq('student_id', studentId)
    if (error) warnings.push(`${table}: ${error.message}`)
  }

  const { error: stuErr } = await admin.from('students').delete().eq('id', studentId)
  if (stuErr) warnings.push(`students: ${stuErr.message}`)

  if ((student as any).profile_id) {
    const pid = (student as any).profile_id
    const { error } = await admin.from('profiles').delete().eq('id', pid)
    if (error) warnings.push(`profile: ${error.message}`)
    const { error: authErr } = await admin.auth.admin.deleteUser(pid)
    if (authErr) warnings.push(`auth: ${authErr.message}`)
  }

  revalidatePath('/admin')
  return { success: true, warnings: warnings.length ? warnings : undefined }
}
