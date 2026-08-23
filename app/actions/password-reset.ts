'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { appOrigin, sendEmail } from '@/lib/email'

/**
 * Send a password-reset link through our own mailer.
 *
 * Signup already bypasses Supabase's built-in mailer (capped at a couple of
 * messages an hour, and its links point wherever the dashboard's Site URL
 * happens to be). This does the same for recovery: the admin client mints the
 * recovery token, and Resend delivers a link on our domain. Verifying with a
 * token_hash needs no PKCE state, so the link works even when the email is
 * opened in a different browser than the one that asked for it.
 *
 * Always resolves to success — the form must answer the same whether or not
 * the address has an account, so it can't be used to probe who signed up.
 */
export async function requestPasswordReset(rawEmail: string): Promise<{ success: true }> {
  const email = (rawEmail ?? '').trim().toLowerCase()
  if (!email) return { success: true }

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email })
    const tokenHash = data?.properties?.hashed_token

    if (error || !tokenHash) {
      if (error) console.error('[password-reset] generateLink:', error.message)
      return { success: true }
    }

    const link = `${appOrigin()}/reset-password?token_hash=${encodeURIComponent(tokenHash)}`
    const result = await sendEmail({
      to: email,
      subject: 'Reset your Lesson Studio password',
      html: `
        <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1d21;">
          <h2 style="margin: 0 0 16px; font-size: 20px;">Reset your password</h2>
          <p style="margin: 0 0 24px; line-height: 1.6;">
            Someone asked to reset the password for this Lesson Studio account.
            If that was you, the button below opens a page where you can choose a new one.
          </p>
          <a href="${link}" style="display: inline-block; background: #0a61c9; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
            Choose a new password
          </a>
          <p style="margin: 24px 0 0; line-height: 1.6; font-size: 13px; color: #5c6570;">
            The link expires after an hour and works once. If you didn't ask for
            this, you can ignore this email — your password hasn't changed.
          </p>
        </div>
      `,
      text: `Someone asked to reset the password for this Lesson Studio account.\n\nChoose a new password: ${link}\n\nThe link expires after an hour and works once. If you didn't ask for this, you can ignore this email — your password hasn't changed.`,
    })
    if (!result.sent) console.error('[password-reset] send:', result.reason)
  } catch (e: any) {
    console.error('[password-reset]', e?.message || e)
  }

  return { success: true }
}
