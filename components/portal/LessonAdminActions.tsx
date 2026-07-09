'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteLesson } from '@/app/actions/teacher-lessons'

/** Teacher controls on a lesson: regenerate the recap from the recording, or delete the lesson. */
export default function LessonAdminActions({ lessonId, studentId, sourceEventId }: {
  lessonId: string; studentId: string; sourceEventId?: string | null
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<'' | 'regen' | 'del'>('')
  const [err, setErr] = useState('')

  async function regenerate() {
    if (!sourceEventId) { setErr('No recording linked to regenerate from.'); return }
    if (!confirm('Regenerate the recap from the recording? This creates a fresh draft for you to review and re-send.')) return
    setBusy('regen'); setErr('')
    const j = await fetch('/api/recap/build', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: sourceEventId }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Regenerate failed' }))
    if (!j.ok) { setBusy(''); setErr(j.error || 'Regenerate failed'); return }
    router.push(`/teacher/recap/${encodeURIComponent(sourceEventId)}`)
  }

  async function remove() {
    if (!confirm('Delete this lesson and its recap? This removes it from the student’s portal and cannot be undone.')) return
    setBusy('del'); setErr('')
    const res = await deleteLesson(lessonId)
    if (!res.success) { setBusy(''); setErr(res.error || 'Delete failed'); return }
    router.push(`/teacher/students/${studentId}`); router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {sourceEventId && (
        <button className="btn btn-ghost btn-sm" disabled={busy !== ''} onClick={regenerate}>{busy === 'regen' ? 'Regenerating…' : '↻ Regenerate recap'}</button>
      )}
      <button className="btn btn-danger-ghost btn-sm" disabled={busy !== ''} onClick={remove}>{busy === 'del' ? 'Deleting…' : 'Delete lesson'}</button>
      {err && <span style={{ fontSize: 12, color: 'var(--red)' }}>{err}</span>}
    </div>
  )
}
