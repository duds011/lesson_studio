'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LessonExercises from './LessonExercises'
import type { DraftRecap } from './RecapReview'

type Section = { title: string; content: string }
const asText = (c: any) => (Array.isArray(c) ? c.join('\n') : typeof c === 'string' ? c : '')
const JLPT = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

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
  const [note, setNote] = useState<string>(r.teacher_note || '')
  const [homework, setHomework] = useState<string[]>(((r.homework || []) as any[]).map((h) => h?.description || '').filter(Boolean))
  const [busy, setBusy] = useState<'' | 'save' | 'publish'>('')
  const [rebuilding, setRebuilding] = useState(false)
  const [msg, setMsg] = useState('')

  const setSection = (i: number, patch: Partial<Section>) => setSections(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const cleanSections = () => sections.map((s) => ({ title: s.title.trim(), content: s.content.trim() })).filter((s) => s.title || s.content)
  const cleanHomework = () => homework.filter((d) => d.trim()).map((d) => ({ description: d.trim() }))
  const payload = () => ({ eventId: rec.eventId, recap: body, sections: cleanSections(), teacher_note: note, homework: cleanHomework() })

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

  const first = rec.studentName.split(' ')[0]
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : ''
  const m = r.metrics as any
  const dist: Record<string, number> = r.vocab_level_distribution || {}
  const distMax = Math.max(1, ...JLPT.map((l) => dist[l] ?? 0))
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
          </div>
        )}

        {/* ── LESSON: editable sections + note ── */}
        {tab === 'Lesson' && (
          <div role="tabpanel" style={{ display: 'grid', gap: 16, paddingTop: 4 }}>
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
              <h4>Your note to {first}</h4>
              <AutoTextarea value={note} onChange={setNote} placeholder="A personal note for the student…" minRows={3} />
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
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px' }}>Auto-generated from this lesson and sent with the recap. This is exactly what {first} will practice.</p>
              <LessonExercises exercises={r.exercises || []} />
            </section>
          </div>
        )}

        {/* ── VOCABULARY (read-only) ── */}
        {tab === 'Vocabulary' && (
          <div role="tabpanel" style={{ display: 'grid', gap: 16, paddingTop: 4 }}>
            <section className="block">
              <h4>By JLPT level</h4>
              {JLPT.map((lv) => (
                <div className="balance-row" key={lv} style={{ gridTemplateColumns: '40px 1fr 32px', display: 'grid', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                  <span>{lv}</span>
                  <div className="balance-track"><div className="balance-fill student" style={{ width: `${((dist[lv] ?? 0) / distMax) * 100}%` }} /></div>
                  <span>{dist[lv] ?? 0}</span>
                </div>
              ))}
            </section>
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
          <Link href="/" className="btn btn-ghost">Cancel</Link>
          <button className="btn btn-ghost" disabled={busy !== ''} onClick={save}>{busy === 'save' ? 'Saving…' : 'Save draft'}</button>
          <button className="btn btn-green" disabled={busy !== ''} onClick={approve}>{busy === 'publish' ? 'Sending…' : 'Approve & send'}</button>
        </div>
    </div>
  )
}
