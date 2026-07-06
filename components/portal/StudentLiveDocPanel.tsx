'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Shows a "join" card when the teacher has the live doc active; opens the doc
// in its own window. Watches the row via Realtime so it appears/disappears live.
export default function StudentLiveDocPanel({ studentId, initialActive }: { studentId: string; studentName?: string; initialActive: boolean }) {
  const [active, setActive] = useState(initialActive)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`docmeta:${studentId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lesson_docs', filter: `student_id=eq.${studentId}` },
        (payload) => setActive(Boolean((payload.new as any)?.active)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [studentId])

  if (!active) return null

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderColor: '#c7c2f5', background: 'var(--brand-soft)' }}>
      <div>
        <p className="analytics-label" style={{ marginBottom: 2 }}>📝 Live lesson doc</p>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Your teacher started a shared notepad — open it to write together.</span>
      </div>
      <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}
        onClick={() => window.open(`/live/${studentId}`, `livedoc-${studentId}`, 'popup,width=980,height=760,noopener=no')}>
        Open live doc ↗
      </button>
    </div>
  )
}
