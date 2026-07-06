'use client'

import LiveDoc from '@/components/portal/LiveDoc'

export default function LiveDocWindow({ studentId, role, name, title }: { studentId: string; role: 'teacher' | 'student'; name: string; title: string }) {
  return (
    <div className="livedoc-window">
      <div className="livedoc-window-head">
        <span style={{ fontSize: 15 }}>📝</span>
        <strong style={{ fontSize: 14 }}>{title}</strong>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {role === 'teacher' ? 'Teacher' : 'Student'} view</span>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => window.close()}>Close</button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <LiveDoc studentId={studentId} role={role} name={name} fill />
      </div>
    </div>
  )
}
