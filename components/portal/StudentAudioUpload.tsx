'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPortalFile } from '@/lib/portal-upload'
import { useRecorder } from '@/lib/use-recorder'
import AudioPlayer from '@/components/portal/AudioPlayer'

export default function StudentAudioUpload({ lessonId }: { lessonId: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const rec = useRecorder()

  const [busy, setBusy] = useState(false)

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) rec.attach(file, file.name)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function submit() {
    if (!rec.pending) return
    setBusy(true)
    rec.setError('')
    try {
      await uploadPortalFile('student-audio', lessonId, rec.pending.blob, rec.pending.name)
      URL.revokeObjectURL(rec.pending.url)
      rec.clear()
      router.refresh()
    } catch (err: any) {
      rec.setError(err.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <input ref={inputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={onPick} />

      {!rec.pending && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {rec.recording ? (
            <button className="btn btn-danger-ghost btn-sm" onClick={rec.stop}>■ Stop recording</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={rec.start}>● Record audio</button>
          )}
          <button className="btn btn-ghost btn-sm" disabled={rec.recording} onClick={() => inputRef.current?.click()}>Upload a file</button>
          {rec.recording && <span style={{ fontSize: 11, color: 'var(--red)' }}>● Recording… tap stop when done</span>}
        </div>
      )}

      {rec.pending && (
        <div className="surface" style={{ padding: 12, display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>Preview — {rec.pending.name}</div>
          <AudioPlayer src={rec.pending.url} title={rec.pending.name} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" disabled={busy} onClick={submit}>{busy ? 'Sending…' : 'Submit to teacher'}</button>
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={rec.discard}>Discard &amp; redo</button>
          </div>
        </div>
      )}

      {rec.error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{rec.error}</span>}
    </div>
  )
}
