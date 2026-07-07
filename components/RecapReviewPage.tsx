'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormattedContent } from './RecapView'
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
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className="review-input"
      style={{ resize: 'none', overflow: 'hidden', lineHeight: 1.55 }}
    />
  )
}

export default function RecapReviewPage({ rec }: { rec: DraftRecap }) {
  const router = useRouter()
  const r = rec.recap || {}
  const [body, setBody] = useState<string>(asText(r.recap))
  const [sections, setSections] = useState<Section[]>(
    ((r.sections || []) as any[]).map((s) => ({ title: s?.title || '', content: asText(s?.content) })),
  )
  const [note, setNote] = useState<string>(r.teacher_note || '')
  const [homework, setHomework] = useState<string[]>(((r.homework || []) as any[]).map((h) => h?.description || '').filter(Boolean))
  const [busy, setBusy] = useState<'' | 'save' | 'publish'>('')
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

  const first = rec.studentName.split(' ')[0]
  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : ''

  return (
    <main className="wrap page-fade">
      <div className="review-page">
        <Link href="/" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}>← Back to overview</Link>

        <div className="page-head" style={{ marginBottom: 18 }}>
          <div>
            <span className="eyebrow">Review before sending</span>
            <h2 className="title">{rec.studentName} · Lesson recap</h2>
            <p className="sub">{rec.lessonTitle || 'Lesson'}{rec.lessonDate ? ` · ${fmtDate(rec.lessonDate)}` : ''} — edit anything below, then send it to {first}.</p>
          </div>
        </div>

        <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
          <div className="mini"><div className="k">Score</div><div className="v">{r.score ?? '—'}</div></div>
          <div className="mini"><div className="k">Student talk</div><div className="v">{r.talk_percentage ?? '—'}%</div></div>
          <div className="mini"><div className="k">Vocab</div><div className="v">{r.vocab_total_count ?? (r.vocabulary?.length ?? 0)}</div></div>
        </div>

        <div className="review-grid">
          {/* ── Editor ── */}
          <div style={{ display: 'grid', gap: 18 }}>
            <section className="block">
              <h4>Summary</h4>
              <AutoTextarea value={body} onChange={setBody} placeholder="Lesson summary…" minRows={4} />
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
              <h4>Homework</h4>
              <div style={{ display: 'grid', gap: 8 }}>
                {homework.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8 }}>
                    <input value={h} onChange={(e) => setHomework(homework.map((x, j) => j === i ? e.target.value : x))} className="review-input" placeholder="Homework task" />
                    <button className="btn btn-danger-ghost btn-sm" onClick={() => setHomework(homework.filter((_, j) => j !== i))} aria-label="Remove">✕</button>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }} onClick={() => setHomework([...homework, ''])}>+ Add homework</button>
              </div>
            </section>

            <section className="block">
              <h4>Your note to the student</h4>
              <AutoTextarea value={note} onChange={setNote} placeholder="A personal note for the student…" minRows={3} />
            </section>
          </div>

          {/* ── Live preview (how the student sees it) ── */}
          <aside className="review-preview">
            <span className="eyebrow">Student preview</span>
            {body.trim() && <div className="block" style={{ marginTop: 10 }}><FormattedContent content={body} /></div>}
            {cleanSections().map((s, i) => (
              <div className="block" key={i}><h4>{s.title}</h4><FormattedContent content={s.content} /></div>
            ))}
            {cleanHomework().length > 0 && (
              <div className="block"><h4>Homework</h4><ul className="fc-list">{cleanHomework().map((h, i) => <li key={i}>{h.description}</li>)}</ul></div>
            )}
            {note.trim() && <div className="block"><h4>Teacher’s note</h4><p>{note}</p></div>}
            {!body.trim() && cleanSections().length === 0 && <p className="sub" style={{ marginTop: 10 }}>Nothing yet — edits appear here.</p>}
          </aside>
        </div>

        <div className="review-actions">
          <span style={{ fontSize: 13, color: 'var(--green)', marginRight: 'auto' }}>{msg}</span>
          <Link href="/" className="btn btn-ghost">Cancel</Link>
          <button className="btn btn-ghost" disabled={busy !== ''} onClick={save}>{busy === 'save' ? 'Saving…' : 'Save draft'}</button>
          <button className="btn btn-green" disabled={busy !== ''} onClick={approve}>{busy === 'publish' ? 'Sending…' : 'Approve & send'}</button>
        </div>
      </div>
    </main>
  )
}
