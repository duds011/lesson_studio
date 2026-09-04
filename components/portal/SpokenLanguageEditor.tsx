'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setSpokenLanguage } from '@/app/actions/portal-students'
import { SPOKEN_LANGUAGES } from '@/lib/languages'

/**
 * What this student's lessons are SPOKEN in — the transcriber's hint.
 *
 * The third language chip in the header band, beside Learning and Explained in.
 * The recorder used to ask for this before every lesson; asked once here, it
 * never has to again.
 *
 * Unset means "follow my own spoken language" from onboarding, so the chip
 * shows that default rather than pretending the student has an answer of their
 * own. A teacher who changes their default moves every unset student with it.
 */
export default function SpokenLanguageEditor({ studentId, value, fallback }: {
  studentId: string
  value: string | null
  /** The teacher's own spoken language, used when this student has none. */
  fallback: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const shown = value?.trim() || fallback?.trim() || 'English'
  const options = SPOKEN_LANGUAGES.includes(shown) ? SPOKEN_LANGUAGES : [shown, ...SPOKEN_LANGUAGES]

  async function save(next: string) {
    setBusy(true); setError('')
    const res = await setSpokenLanguage(studentId, next)
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
        title="The language your lessons with this student are actually spoken in — what the recorder transcribes against. Not the language they are learning."
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'rgba(255,255,255,.72)', background: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 999, padding: '7px 13px', cursor: 'pointer', font: 'inherit', lineHeight: 1 }}
      >
        Spoken in lessons <strong style={{ color: '#fff', fontWeight: 700 }}>{shown}</strong>
        {!value?.trim() && <span style={{ opacity: .6, fontSize: 11.5 }}>(your default)</span>}
        <span aria-hidden style={{ opacity: .75 }}>✎</span>
      </button>
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <select
        value={draft}
        onChange={(e) => { setDraft(e.target.value); save(e.target.value) }}
        disabled={busy}
        autoFocus
        style={{ border: '1px solid rgba(255,255,255,.35)', borderRadius: 999, padding: '7px 13px', fontSize: 12.5, background: '#fff', color: 'var(--ink)', font: 'inherit', lineHeight: 1 }}
      >
        <option value="">Follow my default ({fallback?.trim() || 'English'})</option>
        {options.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <button disabled={busy} onClick={() => setEditing(false)} style={{ border: '1px solid rgba(255,255,255,.3)', borderRadius: 999, padding: '7px 13px', fontSize: 12.5, background: 'transparent', color: 'rgba(255,255,255,.85)', cursor: 'pointer', font: 'inherit', lineHeight: 1 }}>
        {busy ? 'Saving…' : 'Done'}
      </button>
      {error && <span style={{ fontSize: 12, color: '#ffd9d9' }}>{error}</span>}
    </span>
  )
}
