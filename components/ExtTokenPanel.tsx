'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { rotateExtToken } from '@/app/actions/ext-token'
import { RECORDER_STORE_URL } from '@/lib/recorder'
import { formatDateShort } from '@/lib/portal-utils'

/**
 * The recorder, as a status — not a token.
 *
 * The extension signs in with the teacher's own email and password and fetches
 * its credential itself (/api/ext/token), so there has never been anything for
 * a teacher to paste. This panel used to show the raw token anyway, which read
 * as a chore ("where do I put this?") when the honest answer was "nowhere".
 * What a teacher actually wants to know: is it connected, and how do I set it
 * up. The token survives only as the "sign it out everywhere" security reset.
 */
export default function ExtTokenPanel({ token, lastUsedAt }: {
  token: string | null
  lastUsedAt: string | null
}) {
  const [pending, start] = useTransition()
  const [resetDone, setResetDone] = useState(false)
  const [error, setError] = useState('')

  const connected = Boolean(token)

  const reset = () => {
    if (!confirm('Sign the recorder out on every computer? Recording stops until you sign in again inside the extension.')) return
    start(async () => {
      setError('')
      const res = await rotateExtToken()
      if (!res.success) { setError(res.error || 'Could not reset the recorder connection.'); return }
      setResetDone(true)
    })
  }

  return (
    <div className="settings-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        {connected ? (
          <span className="pill" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
            ● Connected{lastUsedAt ? ` · last recording ${formatDateShort(lastUsedAt)}` : ''}
          </span>
        ) : (
          <span className="pill" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
            ○ Not connected yet
          </span>
        )}
      </div>

      <p className="sub" style={{ fontSize: 12.5, margin: '0 0 14px', maxWidth: '52ch' }}>
        Install the extension in Chrome, then sign in inside it with the same email and password
        you use here. That&rsquo;s the whole setup — nothing to copy or paste.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <a href={RECORDER_STORE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
          Get the extension ↗
        </a>
        <Link href="/recorder" className="btn btn-ghost btn-sm">
          Step-by-step guide
        </Link>
      </div>

      {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: '12px 0 0' }}>{error}</p>}
      {resetDone && (
        <p style={{ color: 'var(--green)', fontSize: 12, fontWeight: 600, margin: '12px 0 0' }}>
          Done — the recorder is signed out everywhere. Sign in again inside the extension to keep recording.
        </p>
      )}

      {connected && !resetDone && (
        <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '14px 0 0' }}>
          Lost a laptop, or worried someone else can record to your account?{' '}
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            style={{ border: 0, background: 'none', padding: 0, font: 'inherit', color: 'var(--red)', fontWeight: 700, cursor: 'pointer' }}
          >
            {pending ? 'Signing out…' : 'Sign the recorder out everywhere'}
          </button>
        </p>
      )}
    </div>
  )
}
