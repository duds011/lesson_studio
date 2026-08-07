'use client'

import { useEffect, useRef, useState } from 'react'

const mmss = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/**
 * The portal's own audio player.
 *
 * The browser's default controls are the one piece of raw browser chrome left
 * in the portal, and they look it — grey, square, and a different shape in
 * every browser.
 *
 * It also fixes a real defect: MediaRecorder writes webm without a duration in
 * the header, so `audio.duration` is Infinity until the file has been played
 * through, and the native control just shows 0:00 / 0:00. Seeking to a
 * ludicrous timestamp forces the browser to scan for the real end, after which
 * the duration is known and we jump back to the start.
 */
export default function AudioPlayer({ src, title, meta }: { src: string; title?: string; meta?: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [now, setNow] = useState(0)
  const [total, setTotal] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const a = ref.current
    if (!a) return

    let fixing = false
    const settle = () => {
      if (Number.isFinite(a.duration) && a.duration > 0) {
        setTotal(a.duration)
        setReady(true)
        return true
      }
      return false
    }

    const onMeta = () => {
      if (settle() || fixing) return
      // Unknown length — make the browser go and find it.
      fixing = true
      const onUpdate = () => {
        if (!Number.isFinite(a.duration)) return
        a.removeEventListener('timeupdate', onUpdate)
        a.currentTime = 0
        fixing = false
        settle()
      }
      a.addEventListener('timeupdate', onUpdate)
      try { a.currentTime = 1e101 } catch { fixing = false }
    }

    const onTime = () => { if (!fixing) setNow(a.currentTime) }
    const onEnd = () => { setPlaying(false); setNow(0); a.currentTime = 0 }

    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('durationchange', onMeta)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('ended', onEnd)
    return () => {
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('durationchange', onMeta)
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('ended', onEnd)
    }
  }, [src])

  const toggle = () => {
    const a = ref.current
    if (!a) return
    if (a.paused) { a.play(); setPlaying(true) } else { a.pause(); setPlaying(false) }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current
    if (!a || !ready) return
    const box = e.currentTarget.getBoundingClientRect()
    const pct = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width))
    a.currentTime = pct * total
    setNow(a.currentTime)
  }

  const pct = total > 0 ? Math.min(100, (now / total) * 100) : 0

  return (
    <div className="k-audio">
      {/* preload=metadata so the length is known before anyone presses play. */}
      <audio ref={ref} src={src} preload="metadata" />

      <button type="button" className="k-audio-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="7" y="5" width="3.6" height="14" rx="1.2" /><rect x="13.4" y="5" width="3.6" height="14" rx="1.2" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5.6c0-.8.9-1.3 1.6-.9l8.1 5.4c.6.4.6 1.4 0 1.8l-8.1 5.4c-.7.4-1.6-.1-1.6-.9z" /></svg>
        )}
      </button>

      <div className="k-audio-body">
        {(title || meta) && (
          <div className="k-audio-head">
            {title && <span className="k-audio-title">{title}</span>}
            {meta && <span className="k-audio-meta">{meta}</span>}
          </div>
        )}
        <div
          className="k-audio-track"
          onClick={seek}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-valuenow={Math.round(now)}
          tabIndex={0}
        >
          <i style={{ width: `${pct}%` }} />
          <span className="k-audio-dot" style={{ left: `${pct}%` }} />
        </div>
        <div className="k-audio-times">
          <span>{mmss(now)}</span>
          <span>{ready ? mmss(total) : '—:—'}</span>
        </div>
      </div>
    </div>
  )
}
