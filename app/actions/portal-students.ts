'use server'

import { randomBytes } from 'crypto'
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
  /** Set when the student was created without an email — the link they join with. */
  inviteCode?: string
  error?: string
}

/**
 * Unguessable, and long enough that nobody can walk the space.
 *
 * 32 hex characters from the platform CSPRNG — the same shape as a password
 * reset token, because that is exactly what it is: whoever holds it can create
 * one account, once.
 */
function newInviteCode(): string {
  return randomBytes(16).toString('hex')
}

export async function createStudent(formData: {
  full_name: string
  /** Blank creates an invite link instead of an account. */
  email?: string
  password?: string
  language: string
  level: string
  /** Language recaps and tests are EXPLAINED in. Empty means English. */
  instruction_language?: string
}): Promise<CreateStudentResult> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const admin = createAdminClient()
  const email = (formData.email ?? '').trim()

  // No email → no auth account yet. The row is real and can hold lessons and
  // payments from day one; the login arrives when the student opens the link.
  if (!email) {
    const { data: invited, error: inviteError } = await admin
      .from('students')
      .insert({
        teacher_id: auth.user.id,
        full_name: formData.full_name,
        email: null,
        language: formData.language,
        level: formData.level,
        instruction_language: formData.instruction_language?.trim() || null,
        invite_code: newInviteCode(),
        invite_created_at: new Date().toISOString(),
      })
      .select('id, invite_code')
      .single()
    if (inviteError) return { success: false, error: inviteError.message }

    revalidatePath('/teacher/dashboard')
    return { success: true, studentId: invited.id, inviteCode: invited.invite_code }
  }

  if (!formData.password) return { success: false, error: 'A password is required when you set the email yourself.' }

  // 1. Create the Supabase auth account for the student.
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
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
    email,
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
      email,
      language: formData.language,
      level: formData.level,
      instruction_language: formData.instruction_language?.trim() || null,
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

/**
 * Set the language this student's recaps and tests are explained in.
 * Empty clears it back to English (NULL keeps existing students unchanged).
 */
export async function setInstructionLanguage(studentId: string, language: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  // Ownership through the teacher's own client, the write through admin —
  // same split every other mutation in this file uses.
  const { data: student } = await auth.supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('teacher_id', auth.user.id)
    .single()
  if (!student) return { success: false, error: 'Student not found' }

  const value = language.trim().slice(0, 40) || null
  const { error } = await createAdminClient()
    .from('students')
    .update({ instruction_language: value })
    .eq('id', studentId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/teacher/students/${studentId}`)
  return { success: true }
}

/**
 * Set what this student's lessons are SPOKEN in — the transcriber's hint.
 *
 * The third of the three language fields, and the only one that used to live
 * outside the app: the recorder asked for it before every lesson and kept the
 * answer in that browser. It is a property of the student, so it belongs here,
 * where the server can read it and the recorder can stop asking.
 *
 * Empty clears it back to NULL, which means "follow my own spoken language"
 * from onboarding — the behaviour every teacher has today.
 */
export async function setSpokenLanguage(studentId: string, language: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const { data: student } = await auth.supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('teacher_id', auth.user.id)
    .single()
  if (!student) return { success: false, error: 'Student not found' }

  const value = language.trim().slice(0, 40) || null
  const { error } = await createAdminClient()
    .from('students')
    .update({ spoken_language: value })
    .eq('id', studentId)
  if (error) {
    console.error('[setSpokenLanguage]', error.message)
    return { success: false, error: 'That could not be saved. Try again in a moment.' }
  }

  revalidatePath(`/teacher/students/${studentId}`)
  return { success: true }
}

/**
 * Set the language this student is LEARNING — the field that picks the recap
 * and test prompts. Only affects lessons generated from here on; recaps
 * already written stay as they are.
 */
export async function setLearningLanguage(studentId: string, language: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const value = language.trim().slice(0, 40)
  if (!value) return { success: false, error: 'Pick a language' }

  const { data: student } = await auth.supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('teacher_id', auth.user.id)
    .single()
  if (!student) return { success: false, error: 'Student not found' }

  const { error } = await createAdminClient()
    .from('students')
    .update({ language: value })
    .eq('id', studentId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/teacher/students/${studentId}`)
  return { success: true }
}

/**
 * How this student reads Japanese — decides whether their recaps carry romaji.
 * NULL/'hiragana' is the behaviour every recap had before this existed.
 */
export async function setJpScript(studentId: string, script: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }
  if (!['beginner', 'hiragana', 'kanji'].includes(script)) return { success: false, error: 'Unknown script' }

  const { data: student } = await auth.supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('teacher_id', auth.user.id)
    .single()
  if (!student) return { success: false, error: 'Student not found' }

  const { error } = await createAdminClient()
    .from('students')
    .update({ jp_script: script })
    .eq('id', studentId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/teacher/students/${studentId}`)
  return { success: true }
}

/**
 * The invite code for a student who has not joined yet.
 *
 * Read back rather than regenerated, so the link the teacher already sent
 * keeps working — reissuing on every view would break the message they put in
 * a Preply chat last week.
 */
export async function studentInviteCode(studentId: string): Promise<{ code?: string; error?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { error: auth.error }

  const { data: student } = await auth.supabase
    .from('students')
    .select('id, profile_id, invite_code')
    .eq('id', studentId)
    .eq('teacher_id', auth.user.id)
    .single()
  if (!student) return { error: 'Student not found' }
  if (student.profile_id) return { error: 'This student has already joined.' }

  // A student added before invites existed has no code — mint one on demand.
  if (student.invite_code) return { code: student.invite_code }

  const code = newInviteCode()
  const { error } = await createAdminClient()
    .from('students')
    .update({ invite_code: code, invite_created_at: new Date().toISOString() })
    .eq('id', studentId)
  if (error) return { error: error.message }
  return { code }
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
  // An invited student has no address to make an account from — their own
  // link is the way in, and it is already waiting for them.
  if (!student.email) return { success: false, error: 'This student has no email yet. Send them their invite link instead.' }

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
