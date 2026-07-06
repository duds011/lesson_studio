'use client'

import { useState, useTransition } from 'react'
import { setLiveDoc } from '@/app/actions/livedoc'
import LiveDoc from '@/components/portal/LiveDoc'

export default function TeacherLiveDocPanel({ studentId, teacherName, initialActive }: { studentId: string; teacherName: string; initialActive: boolean }) {
  const [active, setActive] = useState(initialActive)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const toggle = (next: boolean) => startTransition(async () => {
    setError('')
    const res = await setLiveDoc(studentId, next)
    if (res.success) setActive(next); else setError(res.error || 'Failed')
  })

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <p className="analytics-label" style={{ marginBottom: 2 }}>📝 Live lesson doc</p>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>A shared notepad you and the student edit together in real time.</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {active && <span className="pill green"><span className="dot" />Live</span>}
          <button className={`btn btn-sm ${active ? 'btn-danger-ghost' : 'btn-primary'}`} disabled={pending} onClick={() => toggle(!active)}>
            {pending ? '…' : active ? 'End session' : 'Start live doc'}
          </button>
        </div>
      </div>
      {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{error}</p>}
      {active && <LiveDoc studentId={studentId} role="teacher" name={teacherName} />}
    </div>
  )
}
