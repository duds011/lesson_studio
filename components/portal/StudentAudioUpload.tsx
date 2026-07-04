'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPortalFile } from '@/lib/portal-upload'

export default function StudentAudioUpload({ lessonId }: { lessonId: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function doUpload(file: File | Blob, name: string) {
    setBusy(true)
    setError('')
    try {
      await uploadPortalFile('student-audio', lessonId, file, name)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        doUpload(blob, `recording-${Date.now()}.webm`)
      }
      rec.start()
      recorderRef.current = rec
      setRecording(true)
    } catch {
      setError('Microphone not available — you can upload a file instead.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) doUpload(file, file.name)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <input ref={inputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={onPick} />
      {recording ? (
        <button className="btn btn-danger-ghost btn-sm" onClick={stopRecording}>■ Stop &amp; send</button>
      ) : (
        <button className="btn btn-primary btn-sm" disabled={busy} onClick={startRecording}>
          {busy ? 'Uploading…' : '● Record audio'}
        </button>
      )}
      <button className="btn btn-ghost btn-sm" disabled={busy || recording} onClick={() => inputRef.current?.click()}>
        Upload a file
      </button>
      {recording && <span style={{ fontSize: 11, color: 'var(--red)' }}>Recording… tap stop to send</span>}
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}
