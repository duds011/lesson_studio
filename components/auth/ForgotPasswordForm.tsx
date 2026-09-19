'use client'

import { useT } from '@/components/I18nProvider'
import { rich } from '@/lib/i18n'
import Link from 'next/link'
import { useState } from 'react'
import { requestPasswordReset } from '@/app/actions/password-reset'
import AuthAside from '@/components/AuthAside'

export default function ForgotPasswordForm() {
  const t = useT()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await requestPasswordReset(email)
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="k-auth">
      <AuthAside
        headline="Teach the lesson. We’ll write it up."
        sub="Lesson Studio turns each hour you teach into a recap, a progress chart and a set of practice your student can use."
      />

      <main className="k-auth-main">
        <div className="k-auth-card">
          <h1>{t.forgot.title}</h1>

          {sent ? (
            <>
              <p>{rich(t.forgot.sent, { email: <strong>{email.trim().toLowerCase()}</strong> })}</p>
              <p className="k-fine" style={{ marginTop: 12 }}>
                {t.forgot.spam}
              </p>
              <Link href="/login" className="k-btn-block k-btn-outline" style={{ marginTop: 18 }}>
                {t.forgot.backToSignIn}
              </Link>
            </>
          ) : (
            <>
              <p>{t.forgot.lead}</p>

              <form onSubmit={handleSubmit}>
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

                <button type="submit" className="k-btn-block" disabled={loading} style={{ marginTop: 18 }}>
                  {loading ? t.forgot.sending : t.forgot.send}
                </button>
              </form>

              <div className="k-auth-alt">
                <span>{t.forgot.remembered}</span>
              </div>
              <Link href="/login" className="k-btn-block k-btn-outline">{t.forgot.backToSignIn}</Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
