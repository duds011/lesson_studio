'use client'

import Link from 'next/link'
import type { DraftRecap } from './RecapReview'

export default function RecapsToReview({ drafts }: { drafts: DraftRecap[] }) {
  if (drafts.length === 0) return null

  const fmtDate = (d?: string | number) => d ? new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <p className="analytics-label" style={{ margin: 0 }}>📝 Recaps to review</p>
        <span className="pill" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>{drafts.length} waiting</span>
      </div>
      <div className="directory">
        {drafts.map((d) => (
          <div key={d.eventId} className="student-card" style={{ gridTemplateColumns: 'minmax(140px,1.4fr) 1fr auto', gap: 12 }}>
            <span className="sc-name">{d.studentName}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {d.lessonNumber ? `Lesson ${d.lessonNumber}` : (d.lessonTitle || 'Lesson')}
              {(d.lessonDate || d.createdAt) ? ` · ${fmtDate(d.lessonDate || d.createdAt)}` : ''}
            </span>
            <Link className="btn btn-primary btn-sm" href={`/teacher/recap/${encodeURIComponent(d.eventId)}`}>Review &amp; send</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
