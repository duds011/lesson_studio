'use client'

import { useState } from 'react'

export type DraftRecap = {
  eventId: string
  studentName: string
  status: 'draft' | 'published'
  recap: any
  lessonDate?: string
  lessonTitle?: string
  lessonNumber?: number | null
  createdAt?: number
}

type Section = { title: string; content: string }

const asText = (c: any) => (Array.isArray(c) ? c.join('\n') : typeof c === 'string' ? c : '')

export default function RecapReview({ rec, onClose, onPublished }: {
  rec: DraftRecap
  onClose: () => void
  onPublished: (eventId: string, delivered: boolean, warning?: string) => void
}) {
  const r = rec.recap || {}
  const [body, setBody] = useState<string>(asText(r.recap))
  const [sections, setSections] = useState<Section[]>(
    ((r.sections || []) as any[]).map((s) => ({ title: s?.title || '', content: asText(s?.content) })),
  )
  const [note, setNote] = useState<string>(r.teacher_note || '')
  const [homework, setHomework] = useState<string[]>(((r.homework || []) as any[]).map((h) => h?.description || '').filter(Boolean))
  const [busy, setBusy] = useState<'' | 'save' | 'publish'>('')
  const [msg, setMsg] = useState('')

  const payload = () => ({
    eventId: rec.eventId,
    recap: body,
    sections: sections.map((s) => ({ title: s.title.trim(), content: s.content.trim() })).filter((s) => s.title || s.content),
    teacher_note: note,
    homework: homework.filter((d) => d.trim()).map((d) => ({ description: d.trim() })),
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
    setBusy('')
    onPublished(rec.eventId, Boolean(res.delivered), res.warning)
  }

  const setSection = (i: number, patch: Partial<Section>) => setSections(sections.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const input: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 8, padding: '9px 11px', background: '#fff', width: '100%', font: 'inherit' }
  const area: React.CSSProperties = { ...input, resize: 'vertical', lineHeight: 1.5 }

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={`${rec.studentName} recap review`} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <div><span className="eyebrow">Review before sending</span><h3>{rec.studentName} · Lesson recap</h3></div>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="drawer-body">
          <div className="review-banner">AI draft — edit, add or remove anything below, then approve to send it to {rec.studentName.split(' ')[0]}.</div>

          <div className="mini-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
            <div className="mini"><div className="k">Score</div><div className="v">{r.score ?? '—'}</div></div>
            <div className="mini"><div className="k">Student talk</div><div className="v">{r.talk_percentage ?? '—'}%</div></div>
            <div className="mini"><div className="k">Vocab</div><div className="v">{r.vocab_total_count ?? (r.vocabulary?.length ?? 0)}</div></div>
          </div>

          {/* Editable: recap summary */}
          <div className="block">
            <h4>Summary</h4>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} style={area} placeholder="Lesson summary…" />
          </div>

          {/* Editable: each section (title + content), add/remove */}
          {sections.map((s, i) => (
            <div className="block" key={i}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <input value={s.title} onChange={(e) => setSection(i, { title: e.target.value })} style={{ ...input, fontWeight: 700 }} placeholder="Section title" />
                <button className="btn btn-danger-ghost btn-sm" onClick={() => setSections(sections.filter((_, j) => j !== i))} aria-label="Remove section">✕</button>
              </div>
              <textarea value={s.content} onChange={(e) => setSection(i, { content: e.target.value })} rows={4} style={area} placeholder="Section content…" />
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={() => setSections([...sections, { title: '', content: '' }])}>+ Add section</button>

          {/* Editable: homework */}
          <div className="block">
            <h4>Homework</h4>
            <div style={{ display: 'grid', gap: 6 }}>
              {homework.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 6 }}>
                  <input value={h} onChange={(e) => setHomework(homework.map((x, j) => j === i ? e.target.value : x))} style={input} placeholder="Homework task" />
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => setHomework(homework.filter((_, j) => j !== i))} aria-label="Remove">✕</button>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }} onClick={() => setHomework([...homework, ''])}>+ Add homework</button>
            </div>
          </div>

          {/* Editable: teacher note */}
          <div className="block">
            <h4>Your note to the student</h4>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} style={area} placeholder="A personal note for the student…" />
          </div>
        </div>

        <div className="drawer-foot">
          <span style={{ fontSize: 12, color: 'var(--green)', marginRight: 'auto' }}>{msg}</span>
          <button className="btn btn-ghost" disabled={busy !== ''} onClick={save}>{busy === 'save' ? 'Saving…' : 'Save draft'}</button>
          <button className="btn btn-green" disabled={busy !== ''} onClick={approve}>{busy === 'publish' ? 'Sending…' : 'Approve & send'}</button>
        </div>
      </div>
    </div>
  )
}
