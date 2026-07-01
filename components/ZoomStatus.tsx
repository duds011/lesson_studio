'use client'

import { useEffect, useState } from 'react'

type State = { configured: boolean; connected: boolean; email?: string }

export default function ZoomStatus() {
  const [s, setS] = useState<State | null>(null)
  useEffect(() => {
    fetch('/api/zoom/status').then((r) => r.json()).then(setS).catch(() => setS({ configured: false, connected: false }))
  }, [])

  if (!s) return <span className="pill gray"><span className="dot" />Checking Zoom…</span>

  if (!s.configured) {
    return <span className="pill amber"><span className="dot" />Zoom app not set up yet</span>
  }
  if (!s.connected) {
    return <a className="btn btn-primary btn-sm" href="/api/zoom/auth">🔗 Connect Zoom</a>
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}>
      <span className="pill green"><span className="dot" />Zoom connected · {s.email}</span>
      <form action="/api/zoom/disconnect" method="post" style={{ display: 'inline' }}>
        <button className="btn btn-danger-ghost btn-sm" type="submit">Disconnect</button>
      </form>
    </span>
  )
}
