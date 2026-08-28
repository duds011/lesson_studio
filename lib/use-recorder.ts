'use client'

import { useEffect, useRef, useState } from 'react'

/** The first container this browser will actually record into. */
export function pickMime() {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const m of ['audio/webm', 'audio/mp4', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported(m)) return m
  }
  return ''
}

export type Pending = { blob: Blob; url: string; name: string }

/**
 * Record from the microphone into a previewable blob.
 *
 * Shared by the lesson's free-form practice upload and by the speaking
 * exercises, which record the same way but submit against an exercise rather
 * than the lesson as a whole. Nothing here knows where the audio goes — the
 * caller owns the upload.
 */
export function useRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [recording, setRecording] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<Pending | null>(null)

  useEffect(() => () => { if (pending) URL.revokeObjectURL(pending.url) }, [pending])

  /** Hand the caller's own blob (a picked file) to the preview. */
  function attach(blob: Blob, name: string) {
    setPending((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return { blob, url: URL.createObjectURL(blob), name }
    })
  }

  async function start() {
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
        attach(new Blob(chunksRef.current, { type }), `recording-${Date.now()}.${ext}`)
      }
      rec.start()
      recorderRef.current = rec
      setRecording(true)
      return true
    } catch {
      setError('Microphone blocked. Allow mic access in your browser and try again.')
      return false
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
  }

  /** Drop the preview without revoking — the caller already did, post-upload. */
  function clear() {
    setPending(null)
  }

  return { recording, error, setError, pending, attach, start, stop, discard, clear }
}
