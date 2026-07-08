'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      router.push(profile?.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="wrap page-fade" style={{ marginLeft: 0 }}>
      <div className="connect-card" style={{ maxWidth: 440 }}>
        <div className="g-orb" style={{ background: 'var(--brand-soft)', borderColor: 'transparent' }}>
          <span style={{ fontSize: 22 }}>📚</span>
        </div>
        <h1>Sign in</h1>
        <p>Welcome back. Sign in to see your lessons, progress, and recaps.</p>

        <form onSubmit={handleLogin} style={{ marginTop: 22 }}>
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="warn-box" style={{ marginTop: 12, borderColor: '#f0cece', background: 'var(--red-soft)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: '12px 14px' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="fineprint" style={{ marginTop: 16 }}>
          Teacher? <Link href="/signup" style={{ color: 'var(--brand)', fontWeight: 700 }}>Create an account</Link>
        </p>
        <p className="fineprint">Students: your account is created by your teacher — ask them for your password.</p>
      </div>
    </main>
  )
}
