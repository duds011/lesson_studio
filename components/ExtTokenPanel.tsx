'use client'

import { useState, useTransition } from 'react'
import { rotateExtToken } from '@/app/actions/ext-token'
import { formatDateShort } from '@/lib/portal-utils'

/**
 * The teacher's own recorder token — what the Chrome extension authenticates
 * with, and what tells the server whose lesson a recording is.
 */
export default function ExtTokenPanel({ token, lastUsedAt, appUrl }: {
  token: string | null
  lastUsedAt: string | null
  appUrl: string
}) {
  const [pending, start] = useTransition()
  const [current, setCurrent] = useState(token)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const generate = (replacing: boolean) => {
    if (replacing && !confirm('Replace this token? The extension will stop recording until you paste the new one into its Settings.')) return
    start(async () => {
      setError(''); setCopied(false)
      const res = await rotateExtToken()
      if (!res.success) { setError(res.error || 'Could not create a token'); return }
      setCurrent(res.token ?? null)
    })
  }

  const copy = async () => {
    if (!current) return
    try {
      await navigator.clipboard.writeText(current)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy — select the token and copy it manually.')
    }
  }

  return (
    <div className="settings-card">
      <h3>Lesson recorder</h3>
      <p className="sub" style={{ fontSize: 12, marginBottom: 14 }}>
        The Chrome extension records your lesson and sends it here as a draft recap.
        Paste these two values into its Settings once.
      </p>

      <label className="field" style={{ margin: '0 0 14px' }}>
        <span>Lesson Studio URL</span>
        <input readOnly value={appUrl} onFocus={(e) => e.currentTarget.select()} />
      </label>

      <label className="field" style={{ margin: 0 }}>
        <span>Your extension token</span>
        <input
          readOnly
          value={current ?? 'Not created yet'}
          onFocus={(e) => e.currentTarget.select()}
          style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
        />
      </label>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
        {current ? (
          <>
            <button className="btn btn-ghost btn-sm" onClick={copy} disabled={pending}>
              {copied ? 'Copied ✓' : 'Copy token'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => generate(true)} disabled={pending}>
              {pending ? 'Working…' : 'Replace token'}
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => generate(false)} disabled={pending}>
            {pending ? 'Creating…' : 'Create my token'}
          </button>
        )}
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {lastUsedAt ? `Last used ${formatDateShort(lastUsedAt)}` : current ? 'Not used yet' : ''}
        </span>
      </div>

      {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: '10px 0 0' }}>{error}</p>}

      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '12px 0 0' }}>
        Treat it like a password: anyone holding it can post recordings to your account.
        Replacing it immediately stops the old one working.
      </p>
    </div>
  )
}
