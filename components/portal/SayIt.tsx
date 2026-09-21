'use client'

import { useRef, useState } from 'react'

/**
 * Press it and hear the lesson say it.
 *
 * Not a synthesiser and not a dictionary recording: this is the second of the
 * hour where it was actually said, cut out of the recording. Which is also why
 * the button says whose voice it is — on a correction the two halves come from
 * two different mouths, and "you said" / "your teacher said" is most of the
 * teaching. A word with no voice gets no button at all, so this never has to
 * explain itself.
 *
 * If the fetch fails anyway — audio purged between the page rendering and the
 * press — the button goes quiet rather than shouting. There is nothing the
 * listener could do about it.
 */
export default function SayIt({
  lessonId, kind, itemKey, voice, label, tone,
}: {
  lessonId: string
  kind: 'vocab' | 'said' | 'fixed'
  itemKey: string
  voice: 'teacher' | 'student'
  /** What it plays, for the screen reader and the tooltip. */
  label: string
  /** 'quiet' sits on a word; 'inline' sits beside a correction's line. */
  tone?: 'quiet' | 'inline'
}) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<'idle' | 'playing' | 'gone'>('idle')

  if (state === 'gone') return null

  const src = `/api/lesson-audio?lesson=${encodeURIComponent(lessonId)}&kind=${kind}` +
    `&key=${encodeURIComponent(itemKey)}&voice=${voice}`

  function play() {
    const el = ref.current ?? new Audio(src)
    ref.current = el
    el.onended = () => setState('idle')
    el.onerror = () => setState('gone')
    el.currentTime = 0
    setState('playing')
    el.play().catch(() => setState('gone'))
  }

  const who = voice === 'teacher' ? 'your teacher' : 'you'
  return (
    <button
      type="button"
      onClick={play}
      className={`say-it${voice === 'student' ? ' mine' : ''}${tone === 'inline' ? ' inline' : ''}${state === 'playing' ? ' on' : ''}`}
      aria-label={`Hear ${who} say ${label}`}
      title={`Hear ${who} say it`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M11 5 6 9H3v6h3l5 4z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      </svg>
      {tone === 'inline' && <span>{voice === 'teacher' ? 'Teacher' : 'You'}</span>}
    </button>
  )
}
