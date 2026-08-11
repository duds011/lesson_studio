'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadTestAudio } from '@/lib/portal-upload'
import AudioPlayer from '@/components/portal/AudioPlayer'

function pickMime() {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const m of ['audio/webm', 'audio/mp4', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported(m)) return m
  }
  return ''
}

/**
 * One speaking prompt's answer: record, listen back, send — or re-record.
 *
 * The speaking part of a test used to be read-only, which made it homework on
 * the honour system: the teacher asked the question and could never hear the
 * answer. Each prompt now records in place, and a re-record replaces the old
 * take server-side, so what reaches the teacher is the student's chosen best.
 */
export default function TestSpeakingRecorder({ testId, promptIndex, existing }: {
  testId: string
  promptIndex: number
  /** A previously submitted take, playable via the signed download route. */
  existing?: { id: string; createdAt?: string | null } | null
}) {
  const router = useRouter()
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{ blob: Blob; url: string; name: string } | null>(null)
  const [sentUrl, setSentUrl] = useState<string | null>(null)

  useEffect(() => () => { if (pending) URL.revokeObjectURL(pending.url) }, [pending])

  // The stored take streams through the same signed-URL route as lesson audio.
  useEffect(() => {
    let dead = false
    if (!existing?.id) return
    fetch(`/api/portal/download?kind=audio&id=${existing.id}`)
      .then((r) => r.json())
      .then((j) => { if (!dead && j.url) setSentUrl(j.url) })
      .catch(() => { /* the row is there; playback just is not — the Record button still works */ })
    return () => { dead = true }
  }, [existing?.id])

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
        const blob = new Blob(chunksRef.current, { type })
        setPending((prev) => {
          if (prev) URL.revokeObjectURL(prev.url)
          return { blob, url: URL.createObjectURL(blob), name: `speaking-${promptIndex + 1}-${Date.now()}.${ext}` }
        })
      }
      rec.start()
      recorderRef.current = rec
      setRecording(true)
    } catch {
      setError('Microphone blocked — allow mic access in the address bar and try again.')
    }
  }

  function stop() {
    recorderRef.current?.stop()
    setRecording(false)
  }

  async function send() {
    if (!pending) return
    setBusy(true); setError('')
    try {
      await uploadTestAudio(testId, promptIndex, pending.blob, pending.name)
      // Keep playing the local take — it is byte-identical to what was sent.
      setSentUrl(pending.url)
      setPending(null)
      router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tsr">
      {sentUrl && !pending && (
        <div className="tsr-sent">
          <span className="tsr-check" aria-hidden>✓</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <AudioPlayer src={sentUrl} title="Your answer" meta={existing?.createdAt ? 'sent' : 'sent just now'} />
          </div>
        </div>
      )}

      {pending && (
        <div className="tsr-pending">
          <AudioPlayer src={pending.url} title="Your take" meta="not sent yet" />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={send} disabled={busy}>
              {busy ? 'Sending…' : 'Send this answer'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={start} disabled={busy}>↻ Re-record</button>
          </div>
        </div>
      )}

      {!pending && (
        <button
          type="button"
          className={`tsr-rec ${recording ? 'live' : ''}`}
          onClick={recording ? stop : start}
          disabled={busy}
        >
          {recording ? '■ Stop' : sentUrl ? '🎙️ Record again' : '🎙️ Record your answer'}
        </button>
      )}

      {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: '6px 0 0' }}>{error}</p>}
    </div>
  )
}
