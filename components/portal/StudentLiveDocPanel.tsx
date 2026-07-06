'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LiveDoc from '@/components/portal/LiveDoc'

// Shows the shared doc when the teacher has it live. Watches the row via
// Realtime so it appears/disappears without a refresh.
export default function StudentLiveDocPanel({ studentId, studentName, initialActive }: { studentId: string; studentName: string; initialActive: boolean }) {
  const [active, setActive] = useState(initialActive)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`docmeta:${studentId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lesson_docs', filter: `student_id=eq.${studentId}` },
        (payload) => setActive(Boolean((payload.new as any)?.active)))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lesson_docs', filter: `student_id=eq.${studentId}` },
        (payload) => setActive(Boolean((payload.new as any)?.active)))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [studentId])

  if (!active) return null

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
      <div>
        <p className="analytics-label" style={{ marginBottom: 2 }}>📝 Live lesson doc</p>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Your teacher started a shared notepad — edits appear live for both of you.</span>
      </div>
      <LiveDoc studentId={studentId} role="student" name={studentName} />
    </div>
  )
}
