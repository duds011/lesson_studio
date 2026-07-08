'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signUpTeacher } from '@/app/actions/teacher-signup'

export default function TeacherSignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')

    const res = await signUpTeacher({ full_name: fullName, email, password })
    if (!res.success) { setError(res.error || 'Could not create your account.'); setLoading(false); return }

    // Sign the new teacher in, then send them to connect their calendar.
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError(authError.message); setLoading(false); return }
    router.push('/'); router.refresh()
  }

  return (
    <main className="wrap page-fade" style={{ marginLeft: 0 }}>
      <div className="connect-card" style={{ maxWidth: 440 }}>
        <div className="g-orb" style={{ background: 'var(--brand-soft)', borderColor: 'transparent' }}>
          <span style={{ fontSize: 22 }}>📚</span>
        </div>
        <h1>Create your teacher account</h1>
        <p>Set up your workspace, add your students, and get automatic AI recaps from your lessons.</p>

        <form onSubmit={handleSignup} style={{ marginTop: 22 }}>
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" type="text" placeholder="Jane Sensei" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>

          {error && (
            <div className="warn-box" style={{ marginTop: 12, borderColor: '#f0cece', background: 'var(--red-soft)', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: '12px 14px' }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="fineprint">Already have an account? <Link href="/login" style={{ color: 'var(--brand)', fontWeight: 700 }}>Sign in</Link></p>
      </div>
    </main>
  )
}
