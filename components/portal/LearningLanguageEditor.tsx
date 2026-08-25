'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setLearningLanguage } from '@/app/actions/portal-students'
import { languageOptions } from '@/lib/languages'

/**
 * What this student is LEARNING — the field that picks which recap and test
 * prompts run. Editable so a student created under the wrong language can be
 * put right; the copy says plainly that only future lessons change.
 */
export default function LearningLanguageEditor({ studentId, value }: { studentId: string; value: string | null }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setBusy(true); setError('')
    const res = await setLearningLanguage(studentId, draft)
    setBusy(false)
    if (!res.success) { setError(res.error || 'Could not save'); return }
    setEditing(false)
    router.refresh()
  }

  // Sits inside the dark header band next to InstructionLanguageEditor, so it
  // wears the same white-on-colour pill styles.
  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value ?? ''); setEditing(true) }}
        title="The language this student is learning — recaps and tests are built for it. Click to change (future lessons only)."
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'rgba(255,255,255,.72)', background: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 999, padding: '7px 13px', cursor: 'pointer', font: 'inherit', lineHeight: 1 }}
      >
        Learning <strong style={{ color: '#fff', fontWeight: 700 }}>{value?.trim() || '—'}</strong>
        <span aria-hidden style={{ opacity: .75 }}>✎</span>
      </button>
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <select
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={busy}
        autoFocus
        style={{ border: '1px solid rgba(255,255,255,.35)', borderRadius: 999, padding: '7px 13px', fontSize: 12.5, background: '#fff', color: 'var(--ink)', font: 'inherit', lineHeight: 1 }}
      >
        <option value="" disabled>choose…</option>
        {languageOptions(value).map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <button disabled={busy} onClick={save} style={{ border: 'none', borderRadius: 999, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, background: '#fff', color: 'var(--brand)', cursor: 'pointer', font: 'inherit', lineHeight: 1 }}>{busy ? 'Saving…' : 'Save'}</button>
      <button disabled={busy} onClick={() => setEditing(false)} style={{ border: '1px solid rgba(255,255,255,.3)', borderRadius: 999, padding: '7px 13px', fontSize: 12.5, background: 'transparent', color: 'rgba(255,255,255,.85)', cursor: 'pointer', font: 'inherit', lineHeight: 1 }}>Cancel</button>
      {error && <span style={{ fontSize: 12, color: '#ffd9d9' }}>{error}</span>}
    </span>
  )
}
