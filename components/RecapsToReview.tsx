'use client'

import Link from 'next/link'
import type { DraftRecap } from './RecapReview'

export default function RecapsToReview({ drafts }: { drafts: DraftRecap[] }) {
  if (drafts.length === 0) return null

  const fmtWhen = (d?: string | number) => d ? new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

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
            <Link className="btn btn-primary btn-sm" href={`/teacher/recap/${encodeURIComponent(d.eventId)}`}>Review &amp; send</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
