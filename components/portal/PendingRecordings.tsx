'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { assignRecording, discardRecording, type PendingRecording } from '@/app/actions/recordings'

/**
 * Recordings that arrived without a student, waiting to be filed.
 *
 * This is the first thing on the overview when it has anything in it: the
 * recording is done, the audio is safe, and the only thing standing between it
 * and a recap is a name. Nothing is transcribed until one is chosen, so a
 * mis-filed lesson costs nothing to correct — it has not been built yet.
 */
export default function PendingRecordings({
  recordings,
  students,
}: {
  recordings: PendingRecording[]
  students: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  if (recordings.length === 0) return null

  async function file(recordingId: string) {
    const studentId = picked[recordingId]
    if (!studentId) { setError('Choose who the lesson was with first.'); return }
    setBusy(recordingId)
    setError('')

    const res = await assignRecording(recordingId, studentId)
    if (!res.success || !res.eventId) {
      setBusy(null)
      setError(res.error || 'Could not file this recording.')
      return
    }

    // The build is the same route "Rebuild from recording" uses. Fired from
    // the browser because that route runs on the teacher's own session.
    await fetch('/api/recap/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: res.eventId }),
    }).catch(() => { /* the draft shows as failed with a Retry either way */ })

    setBusy(null)
    router.refresh()
  }

  async function discard(recordingId: string) {
    if (!confirm('Delete this recording? The audio goes with it.')) return
    setBusy(recordingId)
    await discardRecording(recordingId)
    setBusy(null)
    router.refresh()
  }

  return (
    <section className="analytics-card" style={{ marginBottom: 16, borderColor: 'var(--brand)' }}>
      <div className="settings-row" style={{ marginBottom: 10 }}>
        <h2 className="section-heading" style={{ margin: 0 }}>
          {recordings.length === 1 ? 'A lesson is waiting' : `${recordings.length} lessons are waiting`}
        </h2>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '0 0 14px' }}>
        Tell us who each one was with and the recap starts building.
      </p>

      {recordings.map((r) => (
        <div
          key={r.recordingId}
          style={{
            display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
            padding: '12px 0', borderTop: '1px solid var(--line)',
          }}
        >
          <div style={{ flex: '1 1 190px', minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>
              {r.minutes != null ? `${r.minutes} minute lesson` : 'Lesson'}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
              {r.lessonDate ? new Date(`${r.lessonDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Recorded'}
              {r.quiet && <span style={{ color: 'var(--amber)' }}> · {r.quiet} was silent</span>}
            </div>
          </div>

          <select
            value={picked[r.recordingId] ?? ''}
            onChange={(e) => setPicked((p) => ({ ...p, [r.recordingId]: e.target.value }))}
            disabled={busy === r.recordingId}
            aria-label="Student"
            style={{
              flex: '0 1 190px', border: '1px solid var(--line)', borderRadius: 10,
              padding: '10px 11px', font: 'inherit', fontSize: 13, background: '#fff',
            }}
          >
            <option value="">Who was this with?</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <button className="btn btn-primary btn-sm" onClick={() => file(r.recordingId)} disabled={busy === r.recordingId}>
            {busy === r.recordingId ? 'Filing…' : 'Build recap'}
          </button>
          <button className="btn btn-danger-ghost btn-sm" onClick={() => discard(r.recordingId)} disabled={busy === r.recordingId}>
            Delete
          </button>
        </div>
      ))}

      {error && <p style={{ fontSize: 12, color: 'var(--red)', margin: '10px 0 0' }}>{error}</p>}
    </section>
  )
}
