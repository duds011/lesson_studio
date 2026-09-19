'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AuthAside from '@/components/AuthAside'
import LocaleSwitch from '@/components/LocaleSwitch'
import { useT } from '@/components/I18nProvider'

export default function LoginForm() {
  const t = useT()
  const router = useRouter()
  const params = useSearchParams()
  /** Where they were headed before being asked to sign in. */
  const next = params.get('next')
  const expired = params.get('expired') === '1'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      // Only ever back into this app, never to a URL someone else supplied.
      const home = profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'
      router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : home)
      router.refresh()
    }
  }

  return (
    <div className="k-auth">
      <AuthAside
        headline={t.auth.signInHeadline}
        sub={t.auth.signInAside}
      />

      <main className="k-auth-main">
        <LocaleSwitch />
        <div className="k-auth-card">
          <h1>{t.auth.signInTitle}</h1>
          <p>{expired ? t.auth.signInExpired : t.auth.signInSub}</p>

          <form onSubmit={handleLogin}>
            <label className="k-field" htmlFor="email">
              <span>{t.auth.emailLabel}</span>
              <input
                id="email"
                type="email"
                placeholder={t.auth.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label className="k-field" htmlFor="password">
              <span>{t.auth.passwordLabel}</span>
              <input
                id="password"
                type="password"
                placeholder={t.auth.passwordDots}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            {error && <p className="k-error">{error}</p>}

            <button type="submit" className="k-btn-block" disabled={loading} style={{ marginTop: 18 }}>
              {loading ? t.auth.signingIn : t.auth.signInAction}
            </button>
          </form>

          <p className="k-fine" style={{ marginTop: 12, textAlign: 'center' }}>
            <Link href="/forgot-password">{t.auth.forgotPassword}</Link>
          </p>

          {/* Two audiences reach this page, and it used to answer only one of
              them: the student line said “ask your teacher for login details”,
              which stopped being true the day the invite flow landed. Students
              set their own password, from a link — so each half now says what
              that half of the room should actually do next. */}
          <div className="k-auth-alt">
            <span>{t.auth.newHere}</span>
          </div>
          <Link href="/signup" className="k-btn-block k-btn-outline">{t.auth.createAccountLink}</Link>
          <p className="k-fine" style={{ marginTop: 12 }}>
            {t.auth.freeToSetUp}
          </p>

          <p className="k-fine" style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <strong style={{ color: 'var(--ink)' }}>{t.auth.studentQuestion}</strong> {t.auth.studentAnswer}
          </p>
        </div>
      </main>
    </div>
  )
}
