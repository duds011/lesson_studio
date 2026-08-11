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

  if (!editing) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
        Explained in <strong style={{ color: 'var(--ink)' }}>{value?.trim() || 'English'}</strong>
        <button className="btn btn-ghost btn-sm" onClick={() => { setDraft(value ?? ''); setEditing(true) }} aria-label="Change explanation language">✎</button>
      </span>
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
        style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '5px 9px', fontSize: 13, width: 130 }}
      />
      <button className="btn btn-primary btn-sm" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save'}</button>
      <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setEditing(false)}>Cancel</button>
      {error && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
    </span>
  )
}
