'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireTeacher() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { error: 'Not authenticated' as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') return { error: 'Unauthorized' as const }
  return { user, supabase }
}

export interface CreateStudentResult {
  success: boolean
  studentId?: string
  tempPassword?: string
  error?: string
}

export async function createStudent(formData: {
  full_name: string
  email: string
  password: string
  language: string
  level: string
}): Promise<CreateStudentResult> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const admin = createAdminClient()

  // 1. Create the Supabase auth account for the student.
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true, // teacher sets the password — skip email verification
    user_metadata: { full_name: formData.full_name, role: 'student' },
  })
  if (createError) return { success: false, error: createError.message }

  const authUserId = newUser.user.id

  // 2. Ensure the profile row exists with the student role.
  const { error: profileError } = await admin.from('profiles').upsert({
    id: authUserId,
    role: 'student',
    full_name: formData.full_name,
    email: formData.email,
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(authUserId)
    return { success: false, error: profileError.message }
  }

  // 3. Insert the students row linked to this teacher + auth account.
  const { data: studentRow, error: studentError } = await admin
    .from('students')
    .insert({
      teacher_id: auth.user.id,
      profile_id: authUserId,
      full_name: formData.full_name,
      email: formData.email,
      language: formData.language,
      level: formData.level,
    })
    .select('id')
    .single()

  if (studentError) {
    await admin.auth.admin.deleteUser(authUserId)
    return { success: false, error: studentError.message }
  }

  revalidatePath('/teacher/dashboard')
  return { success: true, studentId: studentRow.id }
}

// Retroactively create a login for a student row that has no auth account yet.
export async function createAuthForExistingStudent(studentId: string): Promise<CreateStudentResult> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const { data: student } = await auth.supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .eq('teacher_id', auth.user.id)
    .single()

  if (!student) return { success: false, error: 'Student not found' }
  if (student.profile_id) return { success: false, error: 'Student already has a login' }

  const admin = createAdminClient()
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: student.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: student.full_name, role: 'student' },
  })
  if (createError) return { success: false, error: createError.message }

  const authUserId = newUser.user.id
  await admin.from('profiles').upsert({
    id: authUserId,
    role: 'student',
    full_name: student.full_name,
    email: student.email,
  })

  const { error: linkError } = await admin.from('students').update({ profile_id: authUserId }).eq('id', studentId)
  if (linkError) {
    await admin.auth.admin.deleteUser(authUserId)
    return { success: false, error: linkError.message }
  }

  revalidatePath('/teacher/dashboard')
  return { success: true, studentId, tempPassword }
}

export async function resetStudentPassword(studentId: string, newPassword: string): Promise<CreateStudentResult> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const { data: student } = await auth.supabase
    .from('students')
    .select('profile_id')
    .eq('id', studentId)
    .eq('teacher_id', auth.user.id)
    .single()

  if (!student) return { success: false, error: 'Student not found' }
  if (!student.profile_id) return { success: false, error: 'Student has no login yet' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(student.profile_id, { password: newPassword })
  if (error) return { success: false, error: error.message }

  return { success: true, tempPassword: newPassword }
}

export async function deleteStudent(studentId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const { data: student } = await auth.supabase
    .from('students')
    .select('id, profile_id')
    .eq('id', studentId)
    .eq('teacher_id', auth.user.id)
    .single()

  if (!student) return { success: false, error: 'Student not found' }

  const admin = createAdminClient()
  // FK cascade removes lessons + summaries + sections + vocab + homework.
  const { error: deleteError } = await admin.from('students').delete().eq('id', studentId)
  if (deleteError) return { success: false, error: deleteError.message }

  if (student.profile_id) {
    try {
      await admin.auth.admin.deleteUser(student.profile_id)
    } catch {
      /* non-fatal */
    }
  }

  revalidatePath('/teacher/dashboard')
  return { success: true }
}
