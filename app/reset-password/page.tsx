'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthAside from '@/components/AuthAside'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useSearchParams()
  const tokenHash = params.get('token_hash')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  /** Set once the token is spent — a retry with the same link can't work. */
  const [linkDead, setLinkDead] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validate before verifying: the token works once, so nothing may consume
    // it until the new password is actually usable.
    if (password.length < 6) {
      setError('Your new password needs at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('The two passwords don’t match — give them another look.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: tokenHash ?? '',
    })
    if (verifyError) {
      console.error('[reset-password] verifyOtp:', verifyError.message)
      setLinkDead(true)
      setLoading(false)
      return
    }

    const { data, error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      console.error('[reset-password] updateUser:', updateError.message)
      // The recovery session is live, so re-submitting can still succeed.
      setError(
        /different from the old/i.test(updateError.message)
          ? 'That’s the same password as before — choose a new one.'
          : 'We couldn’t save that password. Please try again.'
      )
      setLoading(false)
      return
    }

    // Signed in by the recovery session — walk them straight home, like login.
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user?.id ?? '').single()
    router.push(profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
    router.refresh()
  }

  const invalid = !tokenHash || linkDead

  return (
    <div className="k-auth">
      <AuthAside
        headline="Teach the lesson. We’ll write it up."
        sub="Lesson Studio turns each hour you teach into a recap, a progress chart and a set of practice your student can use."
      />

      <main className="k-auth-main">
        <div className="k-auth-card">
          <h1>Choose a new password</h1>

          {invalid ? (
            <>
              <p>
                {linkDead
                  ? 'This reset link has expired or was already used. Request a fresh one and try again.'
                  : 'This page only works from the link in a password-reset email. Request one and we’ll send it over.'}
              </p>
              <Link href="/forgot-password" className="k-btn-block" style={{ marginTop: 18 }}>
                Send me a reset link
              </Link>
            </>
          ) : (
            <>
              <p>Pick a new password for your account. You’ll be signed in as soon as it’s saved.</p>

              <form onSubmit={handleReset}>
                <label className="k-field" htmlFor="password">
                  <span>New password</span>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </label>

                <label className="k-field" htmlFor="confirm">
                  <span>Repeat it</span>
                  <input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </label>

                {error && <p className="k-error">{error}</p>}

                <button type="submit" className="k-btn-block" disabled={loading} style={{ marginTop: 18 }}>
                  {loading ? 'Saving…' : 'Save and sign in'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
