'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ExerciseEditor from './ExerciseEditor'
import LessonTopics from './LessonTopics'
import TeacherVoiceMemo, { type HeldMemo } from './portal/TeacherVoiceMemo'
import PendingFiles from './portal/PendingFiles'
import { uploadPortalFile } from '@/lib/portal-upload'
import { asHomework } from '@/lib/portal-utils'
import type { DraftRecap } from './RecapReview'

type Section = { title: string; content: string }
const asText = (c: any) => (Array.isArray(c) ? c.join('\n') : typeof c === 'string' ? c : '')

/** Textarea that grows to fit its content so nothing is hidden behind a scrollbar. */
function AutoTextarea({ value, onChange, placeholder, minRows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; minRows?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.max(el.scrollHeight, minRows * 22) + 'px'
  }, [value, minRows])
  return (
    <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      rows={minRows} className="review-input" style={{ resize: 'none', overflow: 'hidden', lineHeight: 1.55 }} />
  )
}

const TABS = ['Progress', 'Lesson', 'Homework', 'Vocabulary'] as const
type Tab = typeof TABS[number]

export default function RecapReviewPage({ rec }: { rec: DraftRecap }) {
  const router = useRouter()
  const r = rec.recap || {}
  const [tab, setTab] = useState<Tab>('Progress')
  const [body, setBody] = useState<string>(asText(r.recap))
  const [sections, setSections] = useState<Section[]>(
    ((r.sections || []) as any[]).map((s) => ({ title: s?.title || '', content: asText(s?.content) })),
  )
  // See asHomework: `|| []` does not save this, because a string is truthy and
  // then throws on .map.
  const [homework, setHomework] = useState<string[]>(asHomework(r.homework))
  // Corrections are quotes the model pulled from the transcript, so they are
  // the most likely thing to be wrong. The teacher can drop any of them; there
  // is nothing to edit beyond that, because a rewritten "quote" is not a quote.
  const [corrections, setCorrections] = useState<any[]>(Array.isArray(r.corrections) ? r.corrections : [])
  const [didWell, setDidWell] = useState<any[]>(Array.isArray(r.did_well) ? r.did_well : [])
  const [exercises, setExercises] = useState<any[]>(Array.isArray(r.exercises) ? r.exercises : [])
  const [busy, setBusy] = useState<'' | 'save' | 'publish' | 'delete'>('')
  const [rebuilding, setRebuilding] = useState(false)
  const [msg, setMsg] = useState('')
  // A voice memo recorded during review. The lesson row doesn't exist until
  // publish, so the blob waits here and is uploaded right after.
  const memoRef = useRef<HeldMemo | null>(null)
  // Same deal for attachments: no lesson row to hang them on until publish.
  const filesRef = useRef<File[]>([])

  const setSection = (i: number, patch: Partial<Section>) => setSections(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const cleanSections = () => sections.map((s) => ({ title: s.title.trim(), content: s.content.trim() })).filter((s) => s.title || s.content)
  const cleanHomework = () => homework.filter((d) => d.trim()).map((d) => ({ description: d.trim() }))
  const payload = () => ({
    // No teacher_note: the written note was replaced by the voice memo, and
    // omitting the field leaves whatever a past recap stored untouched.
    eventId: rec.eventId, recap: body, sections: cleanSections(),
    homework: cleanHomework(), corrections, did_well: didWell, exercises,
  })

  async function save() {
    setBusy('save'); setMsg('')
    await fetch('/api/recap/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) })
    setBusy(''); setMsg('Saved ✓')
  }
  async function approve() {
    setBusy('publish'); setMsg('')
    await fetch('/api/recap/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) })
    const res = await fetch('/api/recap', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: rec.eventId }) }).then((x) => x.json())
    if (!res.delivered && res.warning) { setBusy(''); setMsg(res.warning); return }
    // Publishing created the lesson — now the memo and files have somewhere to
    // go. The recap is already sent at this point, so a failure here reports
    // what is missing rather than pretending the whole thing failed.
    if (res.lessonId) {
      try {
        if (memoRef.current) {
          await uploadPortalFile('teacher-file', res.lessonId, memoRef.current.blob, memoRef.current.name)
        }
        for (const f of filesRef.current) {
          await uploadPortalFile('teacher-file', res.lessonId, f, f.name)
        }
      } catch {
        setBusy('')
        setMsg('Recap sent, but an attachment failed to upload — add it from the lesson page.')
        return
      }
    }
    router.push('/'); router.refresh()
  }

  async function rebuild() {
    if (!confirm('Rebuild this recap from the recording? This regenerates the summary, sections, homework and fluency metrics, and discards any manual edits.')) return
    setRebuilding(true); setMsg('')
    const res = await fetch('/api/recap/build', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: rec.eventId, studentName: rec.studentName, lessonDate: rec.lessonDate, lessonTitle: rec.lessonTitle }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Rebuild failed' }))
    if (!res.ok) { setRebuilding(false); setMsg(res.error || 'Rebuild failed'); return }
    window.location.reload() // pull the freshly generated recap
  }

  // Retroactive path for drafts generated before the student's explanation
  // language was set: one GPT pass rewrites the explanatory prose, keeping the
  // taught-language material and every measured number. Unsaved edits would be
  // overwritten by the reload, so they are saved first.
  async function translate(language?: string) {
    if (!language && !confirm('Translate the explanations in this recap into the language this student is taught through? Example sentences, quotes and scores stay as they are.')) return
    setRebuilding(true); setMsg('')
    await fetch('/api/recap/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) })
    const res = await fetch('/api/recap/translate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: rec.eventId, language }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Translation failed' }))
    if (res.needLanguage) {
      setRebuilding(false)
      const typed = prompt('This student has no explanation language set yet (you can set one on their student page). Translate the explanations into which language?', '')
      if (typed?.trim()) return translate(typed.trim())
      return
    }
    if (!res.ok) { setRebuilding(false); setMsg(res.error || 'Translation failed'); return }
    window.location.reload() // pull the translated recap
  }

  async function deleteDraft() {
    if (!confirm(`Delete ${rec.studentName}'s draft recap? This removes it from Recaps to review and cannot be undone.`)) return
    setBusy('delete'); setMsg('')
    const res = await fetch('/api/recap', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: rec.eventId }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Could not delete recap' }))
    if (!res.ok) { setBusy(''); setMsg(res.error || 'Could not delete recap'); return }
    router.push('/'); router.refresh()
  }

  const first = rec.studentName.split(' ')[0]
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : ''
  const m = r.metrics as any
  const vocab: any[] = r.vocabulary || []
  const label = (t: Tab) => t === 'Lesson' ? 'Recap' : t

  return (
    <div className="review-page" style={{ maxWidth: 860 }}>
        <Link href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}>← Back to overview</Link>

        <div className="page-head" style={{ marginBottom: 16 }}>
          <div>
            <span className="eyebrow">Review before sending</span>
            <h2 className="title">{rec.studentName} · Lesson recap</h2>
            <p className="sub">{rec.lessonTitle || 'Lesson'}{rec.lessonDate ? ` · ${fmtDate(rec.lessonDate)}` : ''} — review each tab, then send it to {first}.</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-ghost btn-sm" disabled={rebuilding} onClick={() => translate()} title="Rewrite the explanations in the student's language — lesson material and scores stay untouched">
              {rebuilding ? 'Working…' : '🌐 Translate explanations'}
            </button>
            <button className="btn btn-ghost btn-sm" disabled={rebuilding} onClick={rebuild} title="Regenerate from the recording with the latest AI + metrics">
              {rebuilding ? 'Rebuilding…' : '↻ Rebuild from recording'}
            </button>
          </div>
        </div>

        <div className="tabs" role="tablist" aria-label="Recap sections">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'sel' : ''}`} onClick={() => setTab(t)}>{label(t)}</button>
          ))}
        </div>

        {/* ── PROGRESS: stats + short summary ── */}
        {tab === 'Progress' && (
          <div role="tabpanel" style={{ display: 'grid', gap: 18, paddingTop: 4 }}>
            <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              <div className="mini"><div className="k">Score</div><div className="v">{r.score ?? '—'}<span style={{ fontSize: 13, color: 'var(--muted)' }}>/10</span></div></div>
              <div className="mini"><div className="k">Student talk</div><div className="v">{r.talk_percentage ?? '—'}%</div></div>
              <div className="mini"><div className="k">Vocab</div><div className="v">{r.vocab_total_count ?? vocab.length}</div></div>
            </div>

            {m && (
              <section className="block">
                <h4>Fluency metrics</h4>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px' }}>Measured from the recording — not AI-estimated.</p>
                <div className="metric-grid">
                  <div className="metric"><div className="mv">{m.studentWpm ?? '—'}</div><div className="mk">words / min</div><div className="mn">speaking pace</div></div>
                  <div className="metric"><div className="mv">{m.avgResponseSec != null ? `${m.avgResponseSec}s` : '—'}</div><div className="mk">thinking time</div><div className="mn">avg gap before {first} replies</div></div>
                  <div className="metric"><div className="mv">{m.longestTurnSec != null ? `${m.longestTurnSec}s` : '—'}</div><div className="mk">longest answer</div><div className="mn">best unbroken stretch</div></div>
                  <div className="metric"><div className="mv">{m.avgTurnWords ?? '—'}</div><div className="mk">words / answer</div><div className="mn">avg turn length</div></div>
                  <div className="metric"><div className="mv">{m.fillerCount ?? '—'}</div><div className="mk">hesitation words</div><div className="mn">えーと, あの, um…</div></div>
                  <div className="metric"><div className="mv">{m.longPauseCount ?? '—'}</div><div className="mk">long pauses</div><div className="mn">silences ≥ 1.5s</div></div>
                </div>
              </section>
            )}

            <section className="block">
              <h4>Summary</h4>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px' }}>A short overview {first} sees first. Keep it to a couple of sentences.</p>
              <AutoTextarea value={body} onChange={setBody} placeholder="Short lesson summary…" minRows={3} />
            </section>

            {(corrections.length > 0 || didWell.length > 0) && (
              <section className="block">
                <h4>Corrections</h4>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>
                  Quoted from the recording. Remove anything the model got wrong — {first} sees exactly what is left.
                </p>

                <div className="cx-grid">
                  {corrections.map((c, i) => (
                    <div className="cx-card" key={`c${i}`}>
                      <span className="cx-label">{first} said</span>
                      <p className="cx-line">…{c.said}</p>
                      <span className="cx-label">Correction</span>
                      <p className="cx-line cx-fix">{c.correction}</p>
                      <div className="cx-why">
                        {Array.isArray(c.categories) && c.categories.length > 0 && <strong>{c.categories.join(', ')}</strong>}
                        {c.explanation && <p>{c.explanation}</p>}
                      </div>
                      <button
                        className="btn btn-danger-ghost btn-sm"
                        style={{ marginTop: 10 }}
                        onClick={() => setCorrections(corrections.filter((_, j) => j !== i))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {didWell.map((s, i) => (
                    <div className="cx-card cx-good" key={`w${i}`}>
                      <span className="cx-label">{first} said · did well</span>
                      <p className="cx-line">…{s.said}</p>
                      <div className="cx-why"><p>{s.note}</p></div>
                      <button
                        className="btn btn-danger-ghost btn-sm"
                        style={{ marginTop: 10 }}
                        onClick={() => setDidWell(didWell.filter((_, j) => j !== i))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {cleanSections().length > 0 && (
              <section className="block">
                <h4>What we covered</h4>
                <LessonTopics sections={cleanSections()} />
              </section>
            )}
          </div>
        )}

        {/* ── LESSON: the voice memo, then the editable sections ── */}
        {tab === 'Lesson' && (
          <div role="tabpanel" style={{ display: 'grid', gap: 16, paddingTop: 4 }}>
            {/* First on the tab, not after the sections and the Add button.
                A memo is the one part of a recap that only exists if the
                teacher decides to make it, and it was sitting below a variable
                number of section editors — far enough down that the decision
                was never really put to them. It leads now. */}
            <section className="block">
              <h4>🎙️ Voice memo for {first}</h4>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px' }}>
                A quick spoken note — encouragement, pronunciation, anything text can&rsquo;t carry. It goes out with the recap when you approve.
              </p>
              <TeacherVoiceMemo onHold={(m) => { memoRef.current = m }} />
              {/* The script the AI drafted for exactly this recording, right
                  where it is read — it was nowhere on this page before. */}
              {r.audio_script && (
                <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 6px' }}>Suggested script</p>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{r.audio_script}</p>
                </div>
              )}
            </section>

            {sections.map((s, i) => (
              <section className="block" key={i}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input value={s.title} onChange={(e) => setSection(i, { title: e.target.value })} className="review-input" style={{ fontWeight: 700 }} placeholder="Section title" />
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => setSections(sections.filter((_, j) => j !== i))} aria-label="Remove section">Remove</button>
                </div>
                <AutoTextarea value={s.content} onChange={(v) => setSection(i, { content: v })} placeholder="Section content…" minRows={4} />
              </section>
            ))}
            <button className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }} onClick={() => setSections([...sections, { title: '', content: '' }])}>+ Add section</button>
            <section className="block">
              <h4>📎 Files for {first}</h4>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px' }}>
                Slides, a worksheet, anything from the lesson. They go out with the recap when you approve.
              </p>
              <PendingFiles studentFirst={first} onChange={(f) => { filesRef.current = f }} />
            </section>
          </div>
        )}

        {/* ── HOMEWORK ── */}
        {tab === 'Homework' && (
          <div role="tabpanel" style={{ paddingTop: 4 }}>
            <section className="block">
              <h4>Homework</h4>
              <div style={{ display: 'grid', gap: 8 }}>
                {homework.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <input value={h} onChange={(e) => setHomework(homework.map((x, j) => j === i ? e.target.value : x))} className="review-input" placeholder="Homework task" />
                    <button className="btn btn-danger-ghost btn-sm" onClick={() => setHomework(homework.filter((_, j) => j !== i))} aria-label="Remove">✕</button>
                  </div>
                ))}
                {homework.length === 0 && <p className="sub" style={{ margin: 0 }}>No homework yet.</p>}
                <button className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }} onClick={() => setHomework([...homework, ''])}>+ Add homework</button>
              </div>
            </section>
            <section className="block">
              <h4>Practice exercises</h4>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px' }}>
                Auto-generated from this lesson. Fix any wording, move the right answer,
                remove an exercise, or write your own — this is exactly what {first} will practice.
              </p>
              <ExerciseEditor exercises={exercises} onChange={setExercises} />
            </section>
          </div>
        )}

        {/* ── VOCABULARY (read-only) ── */}
        {tab === 'Vocabulary' && (
          <div role="tabpanel" style={{ display: 'grid', gap: 16, paddingTop: 4 }}>
            <section className="block">
              <h4>Words from this lesson {vocab.length ? `· ${vocab.length}` : ''}</h4>
              {vocab.length === 0 ? <p className="sub" style={{ margin: 0 }}>No vocabulary captured.</p> : (
                <div className="vocab-grid">
                  {vocab.map((v, i) => (
                    <div className="vocab-card" key={i}>
                      <div className="vocab-card-top">
                        <span className="jp" style={{ fontSize: '1.15rem', fontWeight: 700 }}>{v.word}</span>
                        {v.jlpt_level && <span className="jlpt sm">{v.jlpt_level}</span>}
                      </div>
                      <span className="romaji">{v.reading}</span>
                      <p style={{ margin: '4px 0 0', fontSize: '.85rem' }}>{v.definition}</p>
                      {v.example_sentence && <p className="jp" style={{ margin: '6px 0 0', fontSize: '.85rem', color: 'var(--muted)' }}>{v.example_sentence}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <div className="review-actions">
          <span style={{ fontSize: 13, color: 'var(--green)', marginRight: 'auto' }}>{msg}</span>
          <button className="btn btn-danger-ghost" disabled={busy !== ''} onClick={deleteDraft}>{busy === 'delete' ? 'Deleting...' : 'Delete draft'}</button>
          <Link href="/" className="btn btn-ghost">Cancel</Link>
          <button className="btn btn-ghost" disabled={busy !== ''} onClick={save}>{busy === 'save' ? 'Saving…' : 'Save draft'}</button>
          <button className="btn btn-green" disabled={busy !== ''} onClick={approve}>{busy === 'publish' ? 'Sending…' : 'Approve & send'}</button>
        </div>
    </div>
  )
}
