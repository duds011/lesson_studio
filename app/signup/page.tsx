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
        data: {
          role: 'teacher',
          full_name: fullName.trim(),
        },
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
    <main className="wrap page-fade" style={{ marginLeft: 0 }}>
      <div className="connect-card" style={{ maxWidth: 460 }}>
        <div className="g-orb" style={{ background: 'var(--brand-soft)', borderColor: 'transparent' }}>
          <span style={{ fontSize: 22 }}>KL</span>
        </div>
        <h1>Create a teacher account</h1>
        <p>Start your Koku Library workspace for students, lesson recaps, bookings, and progress tracking.</p>

        <form onSubmit={handleSignup} style={{ marginTop: 22 }}>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              type="text"
              placeholder="Noa Tanaka"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
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
          </div>

          {error && (
            <div className="warn-box" style={{ marginTop: 12, borderColor: '#f0cece', background: 'var(--red-soft)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          {notice && (
            <div className="warn-box" style={{ marginTop: 12, borderColor: '#b8dec7', background: 'var(--green-soft)', color: 'var(--green)' }}>
              {notice}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: '12px 14px' }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="fineprint">
          Already have an account? <Link href="/login" style={{ fontWeight: 800 }}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}
