'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteLesson } from '@/app/actions/teacher-lessons'

/** Teacher controls on a lesson: regenerate the recap from the recording, or delete the lesson. */
export default function LessonAdminActions({ lessonId, studentId, sourceEventId }: {
  lessonId: string; studentId: string; sourceEventId?: string | null
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<'' | 'regen' | 'del' | 'edit'>('')
  const [err, setErr] = useState('')

  /** Reopen the published recap as a draft, then edit it on the review page. */
  async function edit() {
    setBusy('edit'); setErr('')
    const j = await fetch('/api/recap/edit', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Could not open this recap for editing' }))
    if (!j.ok) { setBusy(''); setErr(j.error || 'Could not open this recap for editing'); return }
    router.push(`/teacher/recap/${encodeURIComponent(j.eventId)}`)
  }

  async function regenerate() {
    if (!sourceEventId) { setErr('No recording linked to regenerate from.'); return }
    if (!confirm('Rebuild this recap from the recording? It re-runs the transcript through the current AI, and lands as a draft for you to review and re-send. The lesson the student sees only changes once you approve it.')) return
    setBusy('regen'); setErr('')
    // Transcribing both tracks and writing a full recap takes a couple of
    // minutes — no timeout here, and the button stays busy throughout.
    const j = await fetch('/api/recap/build', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: sourceEventId }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Rebuild failed' }))
    if (!j.ok) { setBusy(''); setErr(j.error || 'Rebuild failed'); return }
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
        <>
          <button className="btn btn-ghost btn-sm" disabled={busy !== ''} onClick={edit}>{busy === 'edit' ? 'Opening…' : '✎ Edit recap'}</button>
          <button className="btn btn-ghost btn-sm" disabled={busy !== ''} onClick={regenerate}>{busy === 'regen' ? 'Rebuilding… (1-2 min)' : '↻ Rebuild recap'}</button>
        </>
      )}
      <button className="btn btn-danger-ghost btn-sm" disabled={busy !== ''} onClick={remove}>{busy === 'del' ? 'Deleting…' : 'Delete lesson'}</button>
      {err && <span style={{ fontSize: 12, color: 'var(--red)' }}>{err}</span>}
    </div>
  )
}
