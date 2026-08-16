import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * Trade a fresh sign-in for the recorder's long-lived token.
 *
 * The extension used to carry the Supabase session itself and refresh it like
 * a browser would. It cannot: Supabase rotates the refresh token on every use,
 * and the popup and the service worker each held their own copy of the same
 * one. Whichever refreshed second presented a token that had already been
 * spent — "Invalid Refresh Token: Refresh Token Not Found" — and the teacher
 * was told to sign in again, often while holding a finished lesson.
 *
 * So the extension signs in once, calls this, and stores what it gets back:
 * an opaque token with no expiry and nothing to rotate. There is no refresh in
 * the recorder's path at all any more, which is the only way this class of
 * failure actually goes away.
 *
 * Revocation still works the way it did — rotating the token in Settings
 * replaces this row, and the extension holding the old one stops on its next
 * call.
 */
export async function POST(req: Request) {
  const header = req.headers.get('authorization') || ''
  const accessToken = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  // Deliberately a JWT only: this endpoint exists to convert a real sign-in,
  // so a recorder token must not be able to mint another one.
  if (!accessToken || accessToken.split('.').length !== 3) {
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: authed } = await admin.auth.getUser(accessToken)
  if (!authed?.user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 })

  const { data: profile } = await admin
    .from('profiles').select('role').eq('id', authed.user.id).maybeSingle()
  if (profile?.role !== 'teacher') {
    return NextResponse.json({ error: 'Only teachers can use the recorder.' }, { status: 403 })
  }

  // Reuse the teacher's existing token so signing in on a second machine does
  // not silently cut off the first.
  const { data: existing } = await admin
    .from('teacher_ext_tokens').select('token').eq('teacher_id', authed.user.id).maybeSingle()
  if (existing?.token) return NextResponse.json({ token: existing.token })

  const token = randomBytes(32).toString('base64url')
  const { error } = await admin
    .from('teacher_ext_tokens')
    .upsert({ teacher_id: authed.user.id, token, created_at: new Date().toISOString(), last_used_at: null },
      { onConflict: 'teacher_id' })
  if (error) return NextResponse.json({ error: 'Could not set up the recorder.' }, { status: 500 })

  return NextResponse.json({ token })
}
