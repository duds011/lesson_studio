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

  // One row: the link fills what is left, the button keeps its full label. The
  // input never shrinks the button away, and its own colours are explicit —
  // this renders inside headers and modals that repaint inherited text white.
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: compact ? 8 : 14, alignItems: 'stretch' }}>
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        onClick={(e) => e.currentTarget.select()}
        aria-label="Invite link"
        style={{
          flex: '1 1 auto', minWidth: 0, border: '1px solid var(--line)', borderRadius: 10,
          padding: '11px 12px', background: 'var(--surface-2)', fontSize: 12.5, color: 'var(--ink)',
          font: 'inherit', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          textOverflow: 'ellipsis',
        }}
      />
      <button
        type="button"
        onClick={copy}
        style={{
          flex: '0 0 auto', border: '1px solid var(--line)', borderRadius: 10, padding: '0 16px',
          background: copied ? 'var(--green-soft)' : '#fff', color: copied ? 'var(--green)' : 'var(--ink)',
          font: 'inherit', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}
