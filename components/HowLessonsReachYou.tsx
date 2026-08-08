'use client'

import { useEffect, useState } from 'react'

const KEY = 'ls.howLessonsReachYou.dismissed'

const STEPS: [string, string][] = [
  ['Record the lesson', 'Use the browser recorder, or upload the file your platform gives you.'],
  ['We build the recap', 'Summary, vocabulary, corrections and practice, drafted from the transcript.'],
  ['You review and publish', 'Edit anything, then send it — the student sees it in their portal.'],
]

/**
 * The three-step explainer at the top of the overview, with a way out.
 *
 * It earns its place on day one and becomes furniture by week two, so it
 * closes. The choice is kept in localStorage rather than the profile: it is a
 * preference about this screen, not a fact about the teacher, and a column plus
 * a write path for one boolean is more machinery than it deserves.
 *
 * Nothing renders until the effect has read that key. Rendering the panel first
 * and hiding it a tick later would flash it back at someone who has already
 * dismissed it every single time they load the page.
 */
export default function HowLessonsReachYou({ platformLabel }: { platformLabel: string }) {
  const [state, setState] = useState<'unknown' | 'show' | 'hidden'>('unknown')

  useEffect(() => {
    let dismissed = false
    try { dismissed = localStorage.getItem(KEY) === '1' } catch { /* private mode — just show it */ }
    setState(dismissed ? 'hidden' : 'show')
  }, [])

  if (state !== 'show') return null

  const dismiss = () => {
    try { localStorage.setItem(KEY, '1') } catch { /* not persisted, still closes */ }
    setState('hidden')
  }

  return (
    <section className="k-sec" style={{ position: 'relative' }}>
      <button type="button" className="k-sec-close" onClick={dismiss} aria-label="Hide this explanation">
        ×
      </button>

      <div className="k-sec-head">
        <span className="k-sec-icon" aria-hidden>🎙️</span>
        <div>
          <h3>How lessons reach you</h3>
          <p className="desc">
            You teach in {platformLabel}, so nothing is scheduled here. A lesson enters Lesson Studio
            the moment its recording does.
          </p>
        </div>
      </div>

      {STEPS.map(([title, note], i) => (
        <div key={title} className="k-onb-ok" style={i > 0 ? { marginTop: 10 } : undefined}>
          <span aria-hidden>{i + 1}</span>
          <div><strong>{title}</strong><small>{note}</small></div>
        </div>
      ))}
    </section>
  )
}
