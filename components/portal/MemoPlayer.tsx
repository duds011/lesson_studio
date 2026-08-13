'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

const mmss = (s: number) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const RATES = [1, 1.25, 1.5, 2]
const BAR_COUNT = 64

/**
 * Deterministic pseudo-amplitudes. The waveform is a scrubber wearing the
 * shape of the audio, not an analysis of it — decoding a whole webm to draw
 * real peaks would cost a download before anyone pressed play. Seeded from the
 * src so the same memo always draws the same shape.
 */
function makeBars(seed: string): number[] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) }
  const out: number[] = []
  for (let i = 0; i < BAR_COUNT; i++) {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h |= 0
    const r = ((h >>> 0) % 1000) / 1000
    // Speech, not a hum: a slow phrase envelope carries the shape, per-bar
    // noise roughens it, and the result is stretched so quiet parts really do
    // drop. A gentler curve than this drew 40 bars of nearly equal height,
    // which reads as a loading skeleton rather than a voice.
    const phrase = 0.5 + 0.5 * Math.sin(i * 0.55) * Math.sin(i * 0.19 + 1.1)
    const v = 0.35 * r + 0.65 * phrase
    out.push(0.16 + 0.84 * Math.pow(v, 1.5))
  }
  return out
}

/**
 * The voice-memo player for the recap hero: waveform scrubber, ±15s, playback
 * speed. It is the memo's whole interface on a published lesson — if there is
 * no memo, nothing renders this, and nothing else about memos appears.
 *
 * It draws no card of its own. A white panel sitting on the hero's brand
 * colour read as something pasted onto the header rather than part of it, so
 * the whole thing is painted in white-on-brand and spans the band's full
 * width, under a hairline rule. See .k-phead-memo.
 *
 * Carries AudioPlayer's duration fix: MediaRecorder writes webm without a
 * duration header, so `audio.duration` is Infinity until the browser is forced
 * to scan for the real end.
 */
export default function MemoPlayer({ src, title, meta }: { src: string; title: string; meta?: string }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [now, setNow] = useState(0)
  const [total, setTotal] = useState(0)
  const [ready, setReady] = useState(false)
  const [rateIdx, setRateIdx] = useState(0)
  const bars = useMemo(() => makeBars(src), [src])

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

  const skip = (sec: number) => {
    const a = ref.current
    if (!a || !ready) return
    a.currentTime = Math.min(total, Math.max(0, a.currentTime + sec))
    setNow(a.currentTime)
  }

  const cycleRate = () => {
    const a = ref.current
    const next = (rateIdx + 1) % RATES.length
    setRateIdx(next)
    if (a) a.playbackRate = RATES[next]
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current
    if (!a || !ready) return
    const box = e.currentTarget.getBoundingClientRect()
    const pct = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width))
    a.currentTime = pct * total
    setNow(a.currentTime)
  }

  const pct = total > 0 ? now / total : 0

  return (
    <div className="k-memo">
      <audio ref={ref} src={src} preload="metadata" />

      <div className="k-memo-head">
        <span className="k-memo-ic" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v3" />
          </svg>
        </span>
        <div className="k-memo-t">
          <b>{title}</b>
          {meta && <small>{meta}{ready ? ` · ${mmss(total)}` : ''}</small>}
        </div>
        <button type="button" className="k-memo-rate" onClick={cycleRate} aria-label={`Playback speed ${RATES[rateIdx]}x`}>
          {RATES[rateIdx]}×
        </button>
      </div>

      {/* One row, so the wave takes every pixel the header has left over —
          transport on the left, elapsed on the right, nothing boxed. */}
      <div className="k-memo-row">
        <button type="button" className="k-memo-skip" onClick={() => skip(-15)} aria-label="Back 15 seconds">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M11.5 6.5 6 12l5.5 5.5v-3.9c3 0 5.3 1 6.9 3-0.6-4.4-3.3-6.9-6.9-7.1z" /></svg>
          <em>15</em>
        </button>
        <button type="button" className="k-memo-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="7" y="5" width="3.6" height="14" rx="1.2" /><rect x="13.4" y="5" width="3.6" height="14" rx="1.2" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5.6c0-.8.9-1.3 1.6-.9l8.1 5.4c.6.4.6 1.4 0 1.8l-8.1 5.4c-.7.4-1.6-.1-1.6-.9z" /></svg>
          )}
        </button>
        <button type="button" className="k-memo-skip" onClick={() => skip(15)} aria-label="Forward 15 seconds">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12.5 6.5 18 12l-5.5 5.5v-3.9c-3 0-5.3 1-6.9 3 .6-4.4 3.3-6.9 6.9-7.1z" /></svg>
          <em>15</em>
        </button>

        <div
          className="k-memo-wave"
          onClick={seek}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(total)}
          aria-valuenow={Math.round(now)}
          tabIndex={0}
        >
          {bars.map((b, i) => (
            <i key={i} style={{ height: `${Math.round(b * 100)}%` }} className={(i + 0.5) / BAR_COUNT <= pct ? 'on' : ''} />
          ))}
        </div>

        <span className="k-memo-time"><b>{mmss(now)}</b> / {ready ? mmss(total) : '—:—'}</span>
      </div>
    </div>
  )
}
