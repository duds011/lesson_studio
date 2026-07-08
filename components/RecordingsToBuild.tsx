'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type Recording = { eventId: string; studentName: string; lessonTitle?: string; lessonDate?: string }

/** Finished recordings with no recap yet — teacher clicks Build to generate one. */
export default function RecordingsToBuild({ recordings }: { recordings: Recording[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')

  if (recordings.length === 0) return null

  const fmtWhen = (d?: string) => d ? new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

  async function build(r: Recording) {
    setBusy(r.eventId); setErr('')
    const j = await fetch('/api/recap/build', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: r.eventId, studentName: r.studentName, lessonTitle: r.lessonTitle, lessonDate: r.lessonDate }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Build failed' }))
    if (!j.ok) { setBusy(''); setErr(j.error || 'Build failed'); return }
    router.push(`/teacher/recap/${encodeURIComponent(r.eventId)}`)
  }

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <p className="analytics-label" style={{ margin: 0 }}>🎬 Recordings ready</p>
        <span className="pill" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>{recordings.length}</span>
      </div>
      {err && <p style={{ fontSize: 12, color: 'var(--red)', margin: 0 }}>{err}</p>}
      <div className="directory">
        {recordings.map((r) => (
          <div key={r.eventId} className="student-card" style={{ gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
            <div>
              <span className="sc-name">{r.studentName}</span>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{r.lessonTitle ? `${r.lessonTitle} · ` : ''}{fmtWhen(r.lessonDate)}</div>
            </div>
            <button className="btn btn-primary btn-sm" disabled={busy !== ''} onClick={() => build(r)}>{busy === r.eventId ? 'Building…' : 'Build recap'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
