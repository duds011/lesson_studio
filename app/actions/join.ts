'use server'

/**
 * Claiming an invite — the only place in the app where someone who is not
 * signed in creates an account.
 *
 * The invariants, all enforced below rather than by the caller:
 * - the code must match a student row that has NOT been claimed
 * - claiming an email that already has an account NEVER touches that account
 * - the code is cleared in the same statement that links the profile, so a
 *   forwarded link cannot be replayed
 */
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { resolveBrand } from '@/lib/brand'

export type JoinResult = { success: boolean; error?: string }

/** What the join page shows before anyone types anything. */
export type InvitePreview = {
  studentName: string
  teacherName: string
  language: string | null
  /** The teacher's own portal branding — this is their workspace, not ours. */
  portalName: string
  logoText: string
  accent: string
}

/**
 * The little that a holder of the link is allowed to learn.
 *
 * First names and the language only — enough for the student to recognise
 * that the invite is really theirs, and not enough to be worth harvesting if
 * a link goes astray.
 */
export async function invitePreview(code: string): Promise<InvitePreview | null> {
  const admin = createAdminClient()
  const { data: student } = await admin
    .from('students')
    .select('full_name, language, teacher_id, profile_id')
    .eq('invite_code', code)
    .maybeSingle()
  if (!student || student.profile_id) return null

  const { data: teacher } = await admin
    .from('profiles')
    .select('full_name, brand')
    .eq('id', student.teacher_id)
    .maybeSingle()

  const brand = resolveBrand((teacher as any)?.brand)
  return {
    studentName: String(student.full_name ?? '').split(' ')[0] || 'there',
    teacherName: String(teacher?.full_name ?? '').split(' ')[0] || 'Your teacher',
    language: student.language ?? null,
    portalName: brand.portalName,
    logoText: brand.logoText,
    accent: brand.accent,
  }
}

/** Both paths end here: link the auth user to the row and spend the code. */
async function linkProfile(code: string, authUserId: string): Promise<JoinResult> {
  const admin = createAdminClient()
  // Conditional on invite_code AND profile_id, so two people opening the same
  // link at once cannot both win — the second update matches no rows.
  const { data, error } = await admin
    .from('students')
    .update({ profile_id: authUserId, invite_code: null })
    .eq('invite_code', code)
    .is('profile_id', null)
    .select('id')
  if (error) return { success: false, error: error.message }
  if (!data?.length) return { success: false, error: 'This invite link has already been used.' }
  return { success: true }
}

/**
 * Claim as a brand-new account: the student's own email, their own password.
 *
 * The teacher never sees either, which is the point of the whole flow.
 */
export async function claimInvite(code: string, email: string, password: string): Promise<JoinResult> {
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail) return { success: false, error: 'Enter your email address.' }
  if (password.length < 8) return { success: false, error: 'Choose a password of at least 8 characters.' }

  const admin = createAdminClient()
  const { data: student } = await admin
    .from('students')
    .select('id, full_name, profile_id')
    .eq('invite_code', code)
    .maybeSingle()
  if (!student || student.profile_id) return { success: false, error: 'This invite link is no longer valid.' }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true, // the teacher vouched for them; there is no mailer to verify through
    user_metadata: { full_name: student.full_name, role: 'student' },
  })
  // An address that already has an account is NOT a claimable one: honouring
  // it here would let anyone holding a link overwrite a stranger's password.
  // They sign in as themselves and reopen the link instead.
  if (createError) {
    const taken = /already|exists|registered/i.test(createError.message)
    return {
      success: false,
      error: taken
        ? 'That email already has a Lesson Studio account. Sign in with it, then open this link again.'
        : createError.message,
    }
  }

  const authUserId = created.user.id
  const { error: profileError } = await admin.from('profiles').upsert({
    id: authUserId,
    role: 'student',
    full_name: student.full_name,
    email: cleanEmail,
  })
  if (profileError) {
    await admin.auth.admin.deleteUser(authUserId)
    return { success: false, error: profileError.message }
  }

  const linked = await linkProfile(code, authUserId)
  if (!linked.success) {
    await admin.auth.admin.deleteUser(authUserId)
    return linked
  }

  // Cosmetic only — the login lives in auth.users, so a clash with another
  // row's address costs the teacher a displayed email, not the account.
  const { error: emailError } = await admin.from('students').update({ email: cleanEmail }).eq('id', student.id)
  if (emailError) console.warn('[join] could not store student email', emailError.message)
  return { success: true }
}

/**
 * Claim as the account already signed in.
 *
 * The exit from the dead end above: a student who is already in Lesson Studio
 * with another teacher signs in and opens the link, and this attaches the new
 * row to the account they just proved they own.
 */
export async function claimInviteAsCurrentUser(code: string): Promise<JoinResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sign in first.' }

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle()
  // Teachers do not become their own students by clicking a link.
  if (profile?.role !== 'student') return { success: false, error: 'Sign in with your student account to accept this invite.' }

  return linkProfile(code, user.id)
}
