'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { signUpTeacher } from '@/app/actions/signup'

export default function SignupPage() {
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

    const created = await signUpTeacher({ fullName, email, password })
    if (!created.success) {
      setError(created.error || 'Could not create your account.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (signInError) {
      setNotice('Account created — please sign in.')
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <div className="k-auth">
      <aside className="k-auth-side">
        <div className="k-auth-art" aria-hidden>
          <span className="k-orb" style={{ width: 150, height: 150, left: '18%', top: '12%' }} />
          <span className="k-tube" style={{ width: 128, height: 128, right: '16%', top: '40%', transform: 'rotate(-24deg)' }} />
          <span className="k-crystal" style={{ width: 74, height: 86, left: '52%', top: '4%' }} />
          <span className="k-ring" style={{ width: 62, height: 62, left: '10%', top: '62%' }} />
        </div>
        <h2>Your whole teaching practice, in one place.</h2>
        <p>Recordings, AI recaps, bookings and student progress — set up in a couple of minutes.</p>
      </aside>

      <main className="k-auth-main">
        <div className="k-auth-card">
          <h1>Create a teacher account</h1>
          <p>Start your Koku Library workspace for students, lesson recaps, bookings, and progress tracking.</p>

          <form onSubmit={handleSignup}>
            <label className="k-field" htmlFor="fullName">
              <span>Full name</span>
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

            <label className="k-field" htmlFor="password">
              <span>Password</span>
              <input
                id="password"
                type="password"
                placeholder="At least 6 characters"
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="k-fine">
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
