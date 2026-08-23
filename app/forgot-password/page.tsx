'use client'

import Link from 'next/link'
import { useState } from 'react'
import { requestPasswordReset } from '@/app/actions/password-reset'
import AuthAside from '@/components/AuthAside'

export default function ForgotPasswordPage() {
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
          <h1>Reset your password</h1>

          {sent ? (
            <>
              <p>
                If <strong>{email.trim().toLowerCase()}</strong> has an account, a reset
                link is on its way. Open the email and follow the link to choose a new
                password — it expires after an hour.
              </p>
              <p className="k-fine" style={{ marginTop: 12 }}>
                Nothing arriving? Check your spam folder, or try again with the address
                you signed up with.
              </p>
              <Link href="/login" className="k-btn-block k-btn-outline" style={{ marginTop: 18 }}>
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <p>Enter the email address you sign in with and we’ll send you a link to choose a new password.</p>

              <form onSubmit={handleSubmit}>
                <label className="k-field" htmlFor="email">
                  <span>Email address</span>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>

                <button type="submit" className="k-btn-block" disabled={loading} style={{ marginTop: 18 }}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <div className="k-auth-alt">
                <span>Remembered it?</span>
              </div>
              <Link href="/login" className="k-btn-block k-btn-outline">Back to sign in</Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
