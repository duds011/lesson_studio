'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPortalFile } from '@/lib/portal-upload'
import AudioPlayer from '@/components/portal/AudioPlayer'

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const m of ['audio/webm', 'audio/mp4', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported(m)) return m
  }
  return ''
}

export type HeldMemo = { blob: Blob; name: string }

/**
 * A quick voice memo from the teacher to the student, recorded in the browser.
 *
 * Two modes:
 *  - `lessonId` set → "Send to student" uploads straight onto that lesson
 *    (stored as a lesson attachment, played inline in the student's recap).
 *  - `onHold` set (review page, before the lesson row exists) → the memo is
 *    kept in memory and the parent uploads it once publishing has created the
 *    lesson.
 */
export default function TeacherVoiceMemo({ lessonId, onHold }: { lessonId?: string; onHold?: (memo: HeldMemo | null) => void }) {
  const router = useRouter()
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{ blob: Blob; url: string; name: string } | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => () => { if (pending) URL.revokeObjectURL(pending.url) }, [pending])

  async function start() {
    setError(''); setSent(false)
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
        const blob = new Blob(chunksRef.current, { type })
        const name = `Voice memo — ${new Date().toLocaleDateString()}.${ext}`
        setPending((prev) => {
          if (prev) URL.revokeObjectURL(prev.url)
          return { blob, url: URL.createObjectURL(blob), name }
        })
        onHold?.({ blob, name })
      }
      rec.start()
      recorderRef.current = rec
      setRecording(true)
    } catch {
      setError('Microphone blocked — allow mic access in the browser.')
    }
  }

  function stop() {
    recorderRef.current?.stop()
    setRecording(false)
  }

  function discard() {
    if (pending) URL.revokeObjectURL(pending.url)
    setPending(null)
    setError('')
    onHold?.(null)
  }

  async function send() {
    if (!pending || !lessonId) return
    setBusy(true); setError('')
    try {
      await uploadPortalFile('teacher-file', lessonId, pending.blob, pending.name)
      URL.revokeObjectURL(pending.url)
      setPending(null)
      setSent(true)
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {!pending && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {recording ? (
            <button type="button" className="btn btn-danger-ghost btn-sm" onClick={stop}>■ Stop recording</button>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={start}>🎙️ Record voice memo</button>
          )}
          {recording && <span style={{ fontSize: 11, color: 'var(--red)' }}>● Recording… tap stop when done</span>}
          {sent && !recording && <span style={{ fontSize: 11, color: 'var(--green)' }}>Sent ✓</span>}
        </div>
      )}

      {pending && (
        <div className="surface" style={{ padding: 12, display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>Preview — {pending.name}</div>
          <AudioPlayer src={pending.url} title={pending.name} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {lessonId ? (
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={send}>{busy ? 'Sending…' : 'Send to student'}</button>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Will be sent with the recap when you approve.</span>
            )}
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={discard}>Discard &amp; redo</button>
          </div>
        </div>
      )}

      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}
