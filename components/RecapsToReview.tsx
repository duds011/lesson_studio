'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RecapReview, { type DraftRecap } from './RecapReview'

export default function RecapsToReview({ drafts }: { drafts: DraftRecap[] }) {
  const router = useRouter()
  const [list, setList] = useState<DraftRecap[]>(drafts)
  const [open, setOpen] = useState<DraftRecap | null>(null)
  const [flash, setFlash] = useState('')

  if (list.length === 0) return null

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : ''

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <p className="analytics-label" style={{ margin: 0 }}>📝 Recaps to review</p>
        <span className="pill" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>{list.length} waiting</span>
      </div>
      {flash && <p style={{ fontSize: 12, color: 'var(--green)', margin: 0 }}>{flash}</p>}
      <div className="directory">
        {list.map((d) => (
          <div key={d.eventId} className="student-card" style={{ gridTemplateColumns: 'minmax(140px,1.4fr) 1fr auto', gap: 12 }}>
            <span className="sc-name">{d.studentName}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{d.lessonTitle || 'Lesson'}{d.lessonDate ? ` · ${fmtDate(d.lessonDate)}` : ''}</span>
            <button className="btn btn-primary btn-sm" onClick={() => setOpen(d)}>Review &amp; send</button>
          </div>
        ))}
      </div>

      {open && (
        <RecapReview
          rec={open}
          onClose={() => setOpen(null)}
          onPublished={(eventId, delivered, warning) => {
            setOpen(null)
            setList((l) => l.filter((x) => x.eventId !== eventId))
            setFlash(delivered ? 'Sent to the student ✓' : (warning || 'Published (no matching student — link one on the lesson).'))
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
