'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signUpTeacher } from '@/app/actions/signup'
import AuthAside from '@/components/AuthAside'
import LocaleSwitch from '@/components/LocaleSwitch'
import { useT, useLocale } from '@/components/I18nProvider'

export default function SignupForm() {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  /**
   * Create the account server-side (already confirmed, no email sent), then
   * sign straight in. Nothing here depends on Supabase's built-in mailer.
   */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    const created = await signUpTeacher({ fullName, email, password, uiLanguage: locale })
    if (!created.success) {
      setError(created.error || t.auth.createFailed)
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (signInError) {
      setNotice(t.auth.createdNowSignIn)
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="k-auth">
      <AuthAside
        headline={t.auth.signUpHeadline}
        sub={t.auth.signUpAside}
      />

      <main className="k-auth-main">
        <LocaleSwitch />
        <div className="k-auth-card">
          <h1>{t.auth.signUpTitle}</h1>
          <p>{t.auth.signUpSub}</p>

          <form onSubmit={handleSignup}>
            <label className="k-field" htmlFor="fullName">
              <span>{t.auth.fullNameLabel}</span>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>

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
                placeholder={t.auth.passwordHint}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>

            {error && <p className="k-error">{error}</p>}
            {notice && (
              <p className="k-error" style={{ background: 'var(--green-soft)', borderColor: '#b8dec7', color: 'var(--green)' }}>
                {notice}
              </p>
            )}

            <button type="submit" className="k-btn-block" disabled={loading} style={{ marginTop: 18 }}>
              {loading ? t.auth.creatingAccount : t.auth.createAccount}
            </button>
          </form>

          <p className="k-fine">
            {t.auth.haveAccount} <Link href="/login">{t.auth.signInAction}</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
