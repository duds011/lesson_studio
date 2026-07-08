'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Public teacher signup: creates a Supabase auth user with the teacher role and
 * a matching profile row. After this the client signs them in and sends them to
 * connect their calendar. (Open signup for the test phase — add an invite code
 * later if needed.)
 */
export async function signUpTeacher(input: { full_name: string; email: string; password: string }): Promise<{ success: boolean; error?: string }> {
  const full_name = (input.full_name || '').trim()
  const email = (input.email || '').trim().toLowerCase()
  const password = input.password || ''
  if (!full_name) return { success: false, error: 'Please enter your name.' }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { success: false, error: 'Please enter a valid email.' }
  if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' }

  const admin = createAdminClient()
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: 'teacher' },
  })
  if (error) return { success: false, error: error.message }

  const { error: pe } = await admin.from('profiles').upsert({ id: created.user.id, role: 'teacher', full_name, email })
  if (pe) {
    await admin.auth.admin.deleteUser(created.user.id)
    return { success: false, error: pe.message }
  }
  return { success: true }
}
