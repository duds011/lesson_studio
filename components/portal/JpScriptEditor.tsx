'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setJpScript } from '@/app/actions/portal-students'
import { TEST_SCRIPTS, type TestScript } from '@/lib/openai'

/**
 * How this student reads Japanese — the setting that decides whether their
 * recaps carry romaji.
 *
 * Per student, not per teacher: one teacher has a beginner who needs romaji on
 * every line and a third-year who would find it patronising. Shown only for
 * students learning Japanese, since it means nothing anywhere else.
 *
 * Styled for the dark header band it sits in, like its sibling
 * InstructionLanguageEditor.
 */
export default function JpScriptEditor({ studentId, value }: { studentId: string; value: TestScript | null }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const current: TestScript = value ?? 'hiragana'

  async function choose(next: TestScript) {
    setBusy(true); setError('')
    const res = await setJpScript(studentId, next)
    setBusy(false)
    if (!res.success) { setError(res.error || 'Could not save'); return }
    setEditing(false)
    router.refresh()
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        title="How Japanese is written in this student's recaps — click to change"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'rgba(255,255,255,.72)', background: 'rgba(255,255,255,.13)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 999, padding: '7px 13px', cursor: 'pointer', font: 'inherit', lineHeight: 1 }}
      >
        Reads <strong style={{ color: '#fff', fontWeight: 700 }}>{TEST_SCRIPTS[current].label}</strong>
        <span aria-hidden style={{ opacity: .75 }}>✎</span>
      </button>
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {(Object.keys(TEST_SCRIPTS) as TestScript[]).map((s) => (
        <button
          key={s}
          onClick={() => choose(s)}
          disabled={busy}
          title={TEST_SCRIPTS[s].sub}
          style={{
            fontSize: 12, font: 'inherit', lineHeight: 1, cursor: busy ? 'default' : 'pointer',
            borderRadius: 999, padding: '7px 12px',
            background: s === current ? '#fff' : 'rgba(255,255,255,.13)',
            color: s === current ? 'var(--ink)' : 'rgba(255,255,255,.82)',
            border: '1px solid rgba(255,255,255,.22)', fontWeight: s === current ? 700 : 500,
          }}
        >
          {TEST_SCRIPTS[s].label}
        </button>
      ))}
      <button
        onClick={() => { setEditing(false); setError('') }}
        style={{ fontSize: 12, font: 'inherit', color: 'rgba(255,255,255,.7)', background: 'none', border: 0, cursor: 'pointer' }}
      >
        Cancel
      </button>
      {error && <span style={{ fontSize: 11, color: '#ffd7d7' }}>{error}</span>}
    </span>
  )
}
