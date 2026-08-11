'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setInstructionLanguage } from '@/app/actions/portal-students'

/**
 * The one per-student language setting that is editable after creation:
 * what recaps and tests are EXPLAINED in. students.language (what they
 * learn) is deliberately not editable here — changing it mid-course would
 * silently regrade every future recap against a different language.
 */
export default function InstructionLanguageEditor({ studentId, value }: { studentId: string; value: string | null }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setBusy(true); setError('')
    const res = await setInstructionLanguage(studentId, draft)
    setBusy(false)
    if (!res.success) { setError(res.error || 'Could not save'); return }
    setEditing(false)
    router.refresh()
  }

  // Sits inside the dark header band, so everything is styled for white-on-
  // colour — the app's muted/ghost styles disappear against it.
  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value ?? ''); setEditing(true) }}
        title="The language recaps and tests are explained in — click to change"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'rgba(255,255,255,.72)', background: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 999, padding: '7px 13px', cursor: 'pointer', font: 'inherit', lineHeight: 1 }}
      >
        Explained in <strong style={{ color: '#fff', fontWeight: 700 }}>{value?.trim() || 'English'}</strong>
        <span aria-hidden style={{ opacity: .75 }}>✎</span>
      </button>
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="English"
        maxLength={40}
        disabled={busy}
        autoFocus
        onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        style={{ border: '1px solid rgba(255,255,255,.35)', borderRadius: 999, padding: '7px 13px', fontSize: 12.5, width: 120, background: '#fff', color: 'var(--ink)', font: 'inherit', lineHeight: 1 }}
      />
      <button disabled={busy} onClick={save} style={{ border: 'none', borderRadius: 999, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, background: '#fff', color: 'var(--brand)', cursor: 'pointer', font: 'inherit', lineHeight: 1 }}>{busy ? 'Saving…' : 'Save'}</button>
      <button disabled={busy} onClick={() => setEditing(false)} style={{ border: '1px solid rgba(255,255,255,.3)', borderRadius: 999, padding: '7px 13px', fontSize: 12.5, background: 'transparent', color: 'rgba(255,255,255,.85)', cursor: 'pointer', font: 'inherit', lineHeight: 1 }}>Cancel</button>
      {error && <span style={{ fontSize: 12, color: '#ffd9d9' }}>{error}</span>}
    </span>
  )
}
