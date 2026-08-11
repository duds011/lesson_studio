'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface TestLessonOption { id: string; label: string }

// Mirrors TestScript in lib/openai.ts — kept local so the prompt file stays
// out of the client bundle.
const SCRIPT_OPTIONS = [
  { value: 'beginner', label: 'Beginner', sub: 'Hiragana + romaji' },
  { value: 'hiragana', label: 'Hiragana', sub: 'Kana, no romaji' },
  { value: 'kanji', label: 'Kanji + kana', sub: 'Kanji with readings' },
] as const

// Teacher picks a lesson, we ask GPT for a full exam-style test, then land on
// the draft review page. Generation takes a while — keep the modal open with
// a clear progress state. `language` is the teacher's teaching language; the
// script picker only exists for Japanese.
export default function GenerateTestButton({ studentId, lessons, language = '' }: { studentId: string; lessons: TestLessonOption[]; language?: string }) {
  // Unknown language means NO script picker — defaulting to Japanese showed
  // hiragana options to teachers of every other language.
  const isJapanese = /japanese|日本語/i.test(language)
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? '')
  const [script, setScript] = useState<string>('hiragana')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    if (!lessonId) return
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, lessonId, script }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Generation failed')
      router.push(`/teacher/students/${studentId}/tests/${json.testId}`)
    } catch (e: any) {
      setError(e?.message || 'Generation failed')
      setBusy(false)
    }
  }

  return (
    <>
      <button className="btn btn-ghost btn-sm" onClick={() => { setError(''); setOpen(true) }} disabled={lessons.length === 0} title={lessons.length === 0 ? 'Publish a lesson recap first' : undefined}>
        📝 Generate test
      </button>

      {open && (
        <div className="modal-scrim" onClick={() => { if (!busy) setOpen(false) }}>
          <div className="modal-card" style={{ maxWidth: 440, padding: 22 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ margin: 0 }}>Generate a practice test</h3>
              {!busy && <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>}
            </div>
            <p className="sub" style={{ marginTop: 0, marginBottom: 14, fontSize: 12 }}>
              A full {isJapanese ? 'JLPT-style' : 'CEFR-style'} test (vocabulary, grammar, reading, speaking) built from one lesson. You review it as a draft — nothing reaches the student until you publish.
            </p>

            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }} htmlFor="test-lesson">
              Base it on
            </label>
            <select
              id="test-lesson"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              disabled={busy}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface)', marginBottom: 14 }}
            >
              {lessons.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>

            {isJapanese && (
              <>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  Japanese script
                </span>
                <div className="script-picker" role="radiogroup" aria-label="Japanese script" style={{ marginBottom: 14 }}>
                  {SCRIPT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={script === o.value}
                      className={`script-opt ${script === o.value ? 'sel' : ''}`}
                      disabled={busy}
                      onClick={() => setScript(o.value)}
                    >
                      <strong>{o.label}</strong>
                      <span>{o.sub}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: '0 0 10px' }}>{error}</p>}

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={generate} disabled={busy || !lessonId}>
              {busy ? 'Generating… this can take a minute ⏳' : 'Generate draft test'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
