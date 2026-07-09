'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DraftRecap } from './RecapReview'

export default function RecapsToReview({ drafts }: { drafts: DraftRecap[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState('')

  if (drafts.length === 0) return null

  const fmtWhen = (d?: string | number) => d ? new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
  async function deleteDraft(d: DraftRecap) {
    if (!confirm(`Delete ${d.studentName}'s draft recap? This removes it from Recaps to review and cannot be undone.`)) return
    setDeleting(d.eventId)
    const res = await fetch('/api/recap', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: d.eventId }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Could not delete recap' }))
    setDeleting('')
    if (!res.ok) {
      alert(res.error || 'Could not delete recap')
      return
    }
    router.refresh()
  }

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <p className="analytics-label" style={{ margin: 0 }}>📝 Recaps to review</p>
        <span className="pill" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>{drafts.length} waiting</span>
      </div>
      <div className="directory">
        {drafts.map((d) => (
          <div key={d.eventId} className="student-card" style={{ gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center' }}>
            <div>
              <span className="sc-name">{d.studentName}</span>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                {d.lessonNumber ? `Lesson ${d.lessonNumber} · ` : ''}{fmtWhen(d.lessonDate || d.createdAt)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-danger-ghost btn-sm" disabled={deleting === d.eventId} onClick={() => deleteDraft(d)}>
                {deleting === d.eventId ? 'Deleting...' : 'Delete'}
              </button>
              <Link className="btn btn-primary btn-sm" href={`/teacher/recap/${encodeURIComponent(d.eventId)}`}>Review &amp; send</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
