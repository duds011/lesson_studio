'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
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
      {/* Decorative panel — hidden under 900px */}
      <aside className="k-auth-side">
        <div className="k-auth-art" aria-hidden>
          <span className="k-orb" style={{ width: 150, height: 150, left: '18%', top: '12%' }} />
          <span className="k-tube" style={{ width: 128, height: 128, right: '16%', top: '40%', transform: 'rotate(-24deg)' }} />
          <span className="k-crystal" style={{ width: 74, height: 86, left: '52%', top: '4%' }} />
          <span className="k-ring" style={{ width: 62, height: 62, left: '10%', top: '62%' }} />
        </div>
        <h2>Learn today, succeed tomorrow.</h2>
        <p>Every lesson recorded, recapped, and turned into practice you can actually review.</p>
      </aside>

      <main className="k-auth-main">
        <div className="k-auth-card">
          <h1>Sign in</h1>
          <p>{expired ? 'Your session timed out. Sign in and we’ll take you straight back.' : 'Welcome back. Sign in to see your lessons, progress, and recaps.'}</p>

          <form onSubmit={handleLogin}>
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>

            {error && <p className="k-error">{error}</p>}

            <button type="submit" className="k-btn-block" disabled={loading} style={{ marginTop: 18 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="k-fine">
            Teachers can <Link href="/signup">create an account</Link>.
            <br />
            Students should ask their teacher for login details.
          </p>
        </div>
      </main>
    </div>
  )
}
