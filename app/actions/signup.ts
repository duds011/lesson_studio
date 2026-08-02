'use server'

import { createAdminClient } from '@/lib/supabase/admin'

type Result = { success: boolean; error?: string }

/**
 * Create a teacher account server-side, already confirmed.
 *
 * The old flow used client-side `auth.signUp`, which sends a confirmation
 * email through Supabase's built-in mailer. That mailer is capped at a couple
 * of messages an hour, so a handful of signups locked everyone out with
 * "email rate limit exceeded" — and the confirmation step bought nothing,
 * since the app signs the teacher straight into onboarding anyway.
 *
 * Creating the user with the service role and `email_confirm: true` sends no
 * mail at all. The client signs in with the same password immediately after.
 */
export async function signUpTeacher(input: {
  fullName: string
  email: string
  password: string
}): Promise<Result> {
  const fullName = (input.fullName ?? '').trim().slice(0, 80)
  const email = (input.email ?? '').trim().toLowerCase()
  const password = input.password ?? ''

  if (!email || !password) return { success: false, error: 'Email and password are required.' }
  if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' }

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'teacher', full_name: fullName || 'Teacher' },
  })

  if (error) {
    const msg = /already been registered/i.test(error.message)
      ? 'That email already has an account — sign in instead.'
      : error.message
    return { success: false, error: msg }
  }

  // The signup trigger creates the profile row; make sure the role is right
  // and onboarding is pending so the new teacher gets the setup flow.
  await admin.from('profiles').upsert({
    id: data.user.id,
    role: 'teacher',
    full_name: fullName || 'Teacher',
    email,
    onboarding_completed_at: null,
    onboarding_step: 0,
  })

  return { success: true }
}
