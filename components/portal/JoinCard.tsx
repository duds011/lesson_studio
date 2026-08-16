'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { claimInvite, claimInviteAsCurrentUser, type InvitePreview } from '@/app/actions/join'
import { createClient } from '@/lib/supabase/client'
import { shade } from '@/lib/brand'

/**
 * The invitation, in two beats.
 *
 * First the invitation itself — who invited them, to what — and a single
 * button. The form only appears once they have said yes, because a stranger's
 * first sight of this page should be a welcome, not a signup form. Each
 * element fades up a fraction after the one above it, so the card assembles
 * itself rather than snapping into place.
 */
export default function JoinCard({
  code,
  invite,
  signedInAs,
}: {
  code: string
  invite: InvitePreview
  signedInAs: string | null
}) {
  const router = useRouter()
  const [stage, setStage] = useState<'intro' | 'form'>('intro')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const res = await claimInvite(code, email, password)
    if (!res.success) {
      setError(res.error || 'Could not set up your account.')
      setBusy(false)
      return
    }

    // Sign them straight in — they typed the password ten seconds ago, and
    // asking for it again is where people fall off at the last hurdle.
    const { error: signInError } = await createClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (signInError) {
      router.push('/login') // the account exists either way
      return
    }
    router.push('/student/dashboard')
    router.refresh()
  }

  async function claimAsCurrent() {
    setBusy(true)
    setError('')
    const res = await claimInviteAsCurrentUser(code)
    if (!res.success) {
      setError(res.error || 'Could not accept the invite.')
      setBusy(false)
      return
    }
    router.push('/student/dashboard')
    router.refresh()
  }

  // The teacher's own accent, so the first thing the student sees already
  // looks like the portal they are about to walk into.
  const vars = {
    '--join-accent': invite.accent,
    '--join-accent-dark': shade(invite.accent, -0.2),
    '--join-glow': `${invite.accent}22`,
  } as React.CSSProperties

  return (
    <main className="k-join" style={vars}>
      <div className="k-join-glow" aria-hidden />

      <div className="k-join-card k-join-in" key={stage}>
        {stage === 'intro' ? (
          <>
            <div className="k-join-mark k-join-step" style={{ animationDelay: '60ms' }} aria-hidden>
              {invite.logoText}
            </div>
            {/* Their name is the biggest thing on the page. An invitation that
                opens with the product's name reads like a notice; one that
                opens with yours reads like it was meant for you. */}
            <p className="k-join-eyebrow k-join-step" style={{ animationDelay: '140ms' }}>
              Welcome
            </p>
            <h1 className="k-join-title k-join-step" style={{ animationDelay: '200ms' }}>
              {invite.studentName}
            </h1>
            <p className="k-join-sub k-join-step" style={{ animationDelay: '270ms' }}>
              {invite.teacherName} has invited you to <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>{invite.portalName}</strong>
              {invite.language ? `, for your ${invite.language} lessons` : ''} — your recaps, vocabulary and practice,
              all in one place.
            </p>

            {signedInAs ? (
              <>
                <button
                  className="k-join-btn k-join-step"
                  style={{ animationDelay: '340ms' }}
                  onClick={claimAsCurrent}
                  disabled={busy}
                >
                  {busy ? 'Joining…' : `Join as ${signedInAs}`}
                </button>
                {error && <p className="k-join-error">{error}</p>}
                <p className="k-join-fine k-join-step" style={{ animationDelay: '400ms' }}>
                  Not you? <a href="/logout">Sign out</a> and open this link again.
                </p>
              </>
            ) : (
              <>
                <button
                  className="k-join-btn k-join-step"
                  style={{ animationDelay: '340ms' }}
                  onClick={() => setStage('form')}
                >
                  Join
                </button>
                <p className="k-join-fine k-join-step" style={{ animationDelay: '400ms' }}>
                  Takes a few seconds. You choose your own password.
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <p className="k-join-eyebrow k-join-step" style={{ animationDelay: '40ms' }}>
              Joining {invite.portalName}
            </p>
            <h1 className="k-join-title sm k-join-step" style={{ animationDelay: '90ms' }}>
              Set up your login
            </h1>

            <form onSubmit={submit}>
              <label className="k-join-field k-join-step" style={{ animationDelay: '150ms' }} htmlFor="email">
                <span>Your email address</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </label>

              <label className="k-join-field k-join-step" style={{ animationDelay: '210ms' }} htmlFor="password">
                <span>Choose a password</span>
                <input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              {error && <p className="k-join-error">{error}</p>}

              <button
                type="submit"
                className="k-join-btn k-join-step"
                style={{ animationDelay: '270ms' }}
                disabled={busy}
              >
                {busy ? 'Setting up…' : 'Create my account'}
              </button>
            </form>

            <button className="k-join-back" onClick={() => { setStage('intro'); setError('') }} disabled={busy}>
              ← Back
            </button>
          </>
        )}
      </div>
    </main>
  )
}
