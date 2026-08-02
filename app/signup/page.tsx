'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotice('')

    const supabase = createClient()
    const origin = window.location.origin
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/teacher/dashboard`,
        data: { role: 'teacher', full_name: fullName.trim() },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/teacher/dashboard')
      router.refresh()
      return
    }

    setNotice('Check your email to confirm your account, then sign in.')
    setLoading(false)
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
          <div className="k-auth-mark" aria-hidden style={{ fontSize: 17, fontWeight: 800 }}>KL</div>
          <h1>Create a teacher account</h1>
          <p>Start your Koku Library workspace for students, lesson recaps, bookings, and progress tracking.</p>

          <form onSubmit={handleSignup}>
            <label className="k-field" htmlFor="fullName">
              <span>Full name</span>
              <input
                id="fullName"
                type="text"
                placeholder="Noa Tanaka"
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
