'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPortalFile } from '@/lib/portal-upload'
import { useRecorder } from '@/lib/use-recorder'
import AudioPlayer from '@/components/portal/AudioPlayer'

/**
 * The record → listen back → send control under a speaking exercise.
 *
 * Deliberately narrower than the lesson's practice upload: no file picker.
 * This is "say the sentence out loud", and a student who uploads a file they
 * recorded somewhere else has skipped the exercise. It also replaces rather
 * than appends — see the lesson+prompt uniqueness in upload-complete — so the
 * teacher hears one take per prompt, the one the student chose to send.
 */
export default function SpeakingRecorder({
  lessonId,
  promptIndex,
  existing,
  cta = 'Record your answer',
}: {
  lessonId: string
  promptIndex: number
  /** The take already sent for this exercise, if there is one. */
  existing?: { id: string; created_at: string } | null
  /** A read-aloud is several sentences in one take, not a question. */
  cta?: string
}) {
  const router = useRouter()
  const rec = useRecorder()
  const [busy, setBusy] = useState(false)
  const [redo, setRedo] = useState(false)

  async function submit() {
    if (!rec.pending) return
    setBusy(true)
    rec.setError('')
    try {
      await uploadPortalFile('student-audio', lessonId, rec.pending.blob, rec.pending.name, undefined, promptIndex)
      URL.revokeObjectURL(rec.pending.url)
      rec.clear()
      setRedo(false)
      router.refresh()
    } catch (err: any) {
      rec.setError(err.message || 'Could not send that recording. Try again.')
    } finally {
      setBusy(false)
    }
  }

  // Sent already, and not currently recording a replacement: show what the
  // teacher will hear rather than an empty control that hides it.
  if (existing && !redo && !rec.pending && !rec.recording) {
    return (
      <div className="ex-speak">
        <div className="ex-speak-done">✓ Sent to your teacher</div>
        <AudioPlayer src={`/api/portal/download?kind=audio&id=${existing.id}`} title="Your recording" />
        <button className="btn btn-ghost btn-sm" onClick={() => setRedo(true)}>Record it again</button>
      </div>
    )
  }

  return (
    <div className="ex-speak">
      {rec.pending ? (
        <>
          <AudioPlayer src={rec.pending.url} title="Listen back" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" disabled={busy} onClick={submit}>
              {busy ? 'Sending…' : 'Send to teacher'}
            </button>
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={rec.discard}>Try again</button>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {rec.recording ? (
            <>
              <button className="btn btn-danger-ghost btn-sm" onClick={rec.stop}>■ Stop</button>
              <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>● Recording…</span>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-sm" onClick={rec.start}>● {cta}</button>
              {existing && <button className="btn btn-ghost btn-sm" onClick={() => setRedo(false)}>Keep the one I sent</button>}
            </>
          )}
        </div>
      )}

      {rec.error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{rec.error}</span>}
    </div>
  )
}
