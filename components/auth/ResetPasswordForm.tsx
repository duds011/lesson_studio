'use client'

import { useT } from '@/components/I18nProvider'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthAside from '@/components/AuthAside'

export default function ResetPasswordForm() {
  const t = useT()
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
      setError(t.reset.tooShort)
      return
    }
    if (password !== confirm) {
      setError(t.reset.mismatch)
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
          ? t.reset.samePassword
          : t.reset.saveFailed
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
          <h1>{t.reset.title}</h1>

          {invalid ? (
            <>
              <p>
                {linkDead
                  ? t.reset.expired
                  : t.reset.noToken}
              </p>
              <Link href="/forgot-password" className="k-btn-block" style={{ marginTop: 18 }}>
                Send me a reset link
              </Link>
            </>
          ) : (
            <>
              <p>{t.reset.lead}</p>

              <form onSubmit={handleReset}>
                <label className="k-field" htmlFor="password">
                  <span>{t.reset.newPassword}</span>
                  <input
                    id="password"
                    type="password"
                    placeholder={t.auth.passwordDots}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </label>

                <label className="k-field" htmlFor="confirm">
                  <span>{t.reset.repeat}</span>
                  <input
                    id="confirm"
                    type="password"
                    placeholder={t.auth.passwordDots}
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
