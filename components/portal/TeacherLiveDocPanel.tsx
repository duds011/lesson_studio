'use client'

import { useState, useTransition } from 'react'
import { setLiveDoc } from '@/app/actions/livedoc'

function openWindow(studentId: string) {
  window.open(`/live/${studentId}`, `livedoc-${studentId}`, 'popup,width=980,height=760,noopener=no')
}

export default function TeacherLiveDocPanel({ studentId, teacherName, initialActive }: { studentId: string; teacherName: string; initialActive: boolean }) {
  const [active, setActive] = useState(initialActive)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const end = () => startTransition(async () => {
    setError('')
    const res = await setLiveDoc(studentId, false)
    if (res.success) setActive(false); else setError(res.error || 'Failed')
  })

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <div>
        <p className="analytics-label" style={{ marginBottom: 2 }}>📝 Live lesson doc</p>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {active ? 'The shared notepad is live — open it to write with the student.' : 'Opens automatically when you start recording this student’s lesson.'}
        </span>
        {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: '6px 0 0' }}>{error}</p>}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {active ? (
          <>
            <span className="pill green"><span className="dot" />Live</span>
            <button className="btn btn-primary btn-sm" onClick={() => openWindow(studentId)}>Open window ↗</button>
            <button className="btn btn-danger-ghost btn-sm" disabled={pending} onClick={end}>End session</button>
          </>
        ) : (
          <span className="pill" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>Idle</span>
        )}
      </div>
    </div>
  )
}
