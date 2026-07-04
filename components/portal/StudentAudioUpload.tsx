'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPortalFile } from '@/lib/portal-upload'

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const m of ['audio/webm', 'audio/mp4', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported(m)) return m
  }
  return ''
}

export default function StudentAudioUpload({ lessonId }: { lessonId: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Pending recording/file the student can preview before submitting.
  const [pending, setPending] = useState<{ blob: Blob; url: string; name: string } | null>(null)

  useEffect(() => () => { if (pending) URL.revokeObjectURL(pending.url) }, [pending])

  function setPreview(blob: Blob, name: string) {
    setPending((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return { blob, url: URL.createObjectURL(blob), name }
    })
  }

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = pickMime()
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunksRef.current = []
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const type = rec.mimeType || 'audio/webm'
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm'
        setPreview(new Blob(chunksRef.current, { type }), `recording-${Date.now()}.${ext}`)
      }
      rec.start()
      recorderRef.current = rec
      setRecording(true)
    } catch {
      setError('Microphone blocked. Allow mic access, or use “Upload a file”.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(file, file.name)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function submit() {
    if (!pending) return
    setBusy(true)
    setError('')
    try {
      await uploadPortalFile('student-audio', lessonId, pending.blob, pending.name)
      URL.revokeObjectURL(pending.url)
      setPending(null)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  function discard() {
    if (pending) URL.revokeObjectURL(pending.url)
    setPending(null)
    setError('')
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <input ref={inputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={onPick} />

      {!pending && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {recording ? (
            <button className="btn btn-danger-ghost btn-sm" onClick={stopRecording}>■ Stop recording</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={startRecording}>● Record audio</button>
          )}
          <button className="btn btn-ghost btn-sm" disabled={recording} onClick={() => inputRef.current?.click()}>Upload a file</button>
          {recording && <span style={{ fontSize: 11, color: 'var(--red)' }}>● Recording… tap stop when done</span>}
        </div>
      )}

      {pending && (
        <div className="surface" style={{ padding: 12, display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>Preview — {pending.name}</div>
          <audio controls src={pending.url} style={{ width: '100%', height: 38 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" disabled={busy} onClick={submit}>{busy ? 'Sending…' : 'Submit to teacher'}</button>
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={discard}>Discard &amp; redo</button>
          </div>
        </div>
      )}

      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}
