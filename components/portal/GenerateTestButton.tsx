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
  // Multi-select: one lesson makes a quiz, several make a review, and the
  // test's length scales with how many are ticked.
  const [picked, setPicked] = useState<string[]>(lessons[0] ? [lessons[0].id] : [])
  const [script, setScript] = useState<string>('hiragana')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const toggle = (id: string) =>
    setPicked((was) => (was.includes(id) ? was.filter((x) => x !== id) : [...was, id]))

  async function generate() {
    if (picked.length === 0) return
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, lessonIds: picked, script }),
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
              A full {isJapanese ? 'JLPT-style' : 'CEFR-style'} test (vocabulary, grammar, reading, speaking) built from the lessons you tick. You review it as a draft — nothing reaches the student until you publish.
            </p>

            <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 6 }}>
              Base it on ({picked.length} lesson{picked.length === 1 ? '' : 's'} — more lessons, longer test)
            </span>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 10, marginBottom: 14 }}>
              {lessons.map((l) => (
                <label key={l.id} style={{ display: 'flex', gap: 9, alignItems: 'center', padding: '9px 12px', borderBottom: '1px solid var(--line)', cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={picked.includes(l.id)} disabled={busy} onChange={() => toggle(l.id)} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.label}</span>
                </label>
              ))}
            </div>

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

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={generate} disabled={busy || picked.length === 0}>
              {busy ? 'Generating… this can take a minute ⏳' : 'Generate draft test'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
