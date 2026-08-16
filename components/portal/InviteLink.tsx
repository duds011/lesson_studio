'use client'

import { useState } from 'react'

/**
 * The join link, ready to paste into wherever the teacher already talks to
 * this student — Preply chat, WhatsApp, LINE.
 *
 * The origin is read from the browser rather than an env var so the link is
 * always for the host the teacher is actually looking at; a hardcoded
 * production URL would hand out dead links on every preview deployment.
 */
export default function InviteLink({ code, compact = false }: { code: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const url = typeof window === 'undefined' ? `/join/${code}` : `${window.location.origin}/join/${code}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure origin, or the browser said no) — the
      // input below is selectable, so there is still a way through.
      setCopied(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: compact ? 8 : 12, alignItems: 'center' }}>
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        aria-label="Invite link"
        style={{
          flex: 1, minWidth: 0, border: '1px solid var(--line)', borderRadius: 9,
          padding: '10px 12px', background: 'var(--surface-2)', fontSize: 12, color: 'var(--muted)',
        }}
      />
      <button type="button" className="btn btn-ghost btn-sm" onClick={copy} style={{ flexShrink: 0 }}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
