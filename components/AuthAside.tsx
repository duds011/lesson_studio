'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The panel beside the sign-in and sign-up forms.
 *
 * It is the only page a teacher can reach without an account, so it is also the
 * only chance to show them what this is. A list of claims was still just words
 * on a wall — a tool that turns a lesson into charts and flashcards should show
 * the charts and the flashcards. Each slide is a small, honest picture of a
 * real screen, built from the same shapes the app draws.
 *
 * They are markup rather than screenshots on purpose: a screenshot goes stale
 * the first time a card changes, and nobody notices for months.
 *
 * Hidden under 900px (see .k-auth-side) — on a phone the form is the page.
 */

const HOLD_MS = 3200

/** A bar chart of the last five lesson scores, out of ten. */
function ScoreBars({ scores }: { scores: number[] }) {
  const top = 10
  return (
    <div className="k-ac-bars">
      {scores.map((s, i) => (
        <span key={i} style={{ height: `${(s / top) * 100}%` }} className={i === scores.length - 1 ? 'now' : ''}>
          <b>{s.toFixed(1)}</b>
        </span>
      ))}
    </div>
  )
}

const SLIDES = [
  {
    id: 'recap',
    title: 'The lesson writes itself up',
    body: 'A Chrome extension records both voices. The recap comes back drafted — you edit and publish.',
    art: (
      <div className="k-ac-screen">
        <div className="k-ac-tabs">
          <span className="on">Progress</span><span>Lesson</span><span>Practice</span><span>Vocabulary</span>
        </div>
        <div className="k-ac-tiles">
          <div className="k-ac-tile" style={{ ['--t' as any]: '#be123c' }}>
            <small>SPEAKING BALANCE</small>
            <strong>41<i>%</i> / 59<i>%</i></strong>
            <div className="k-ac-bal"><u style={{ width: '41%' }} /></div>
            <div className="k-ac-bal alt"><u style={{ width: '59%' }} /></div>
          </div>
          <div className="k-ac-tile" style={{ ['--t' as any]: '#2f8f5b' }}>
            <small>SCORE</small>
            <strong style={{ color: '#2f8f5b' }}>8.3<i>/10</i></strong>
            <span className="k-ac-chip">Confident</span>
          </div>
          <div className="k-ac-tile" style={{ ['--t' as any]: '#a36210' }}>
            <small>GRAMMAR DENSITY</small>
            <strong className="sm">Medium-High</strong>
            <em>16 vocabulary items practiced</em>
          </div>
        </div>
        <div className="k-ac-note">
          <small>CORRECTIONS</small>
          <p><s>I go to go to Vancouver</s></p>
          <p className="ok">I <b>have</b> to go to Vancouver</p>
          <p className="why"><b>Verb form</b> — the repeated verb becomes “have to”, which states necessity.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'progress',
    title: 'Progress they can actually see',
    body: 'Scores, talk-time and vocabulary tracked lesson to lesson, on a page built for the student.',
    art: (
      <div className="k-ac-screen">
        <div className="k-ac-head"><b>Recent scores</b><span>Last 5</span></div>
        <ScoreBars scores={[6.4, 7.1, 6.9, 7.8, 8.3]} />
        <div className="k-ac-head" style={{ marginTop: 12 }}><b>Next milestone</b><span>Advanced</span></div>
        <div className="k-ac-track">
          {[
            { n: '1', l: 'Sprouting', w: 100 }, { n: '5', l: 'Blooming', w: 100 },
            { n: '10', l: 'Committed', w: 100 }, { n: '25', l: 'Advanced', w: 22 },
            { n: '50', l: 'Master', w: 0 },
          ].map((r) => (
            <span key={r.n}>
              <u><i style={{ width: `${r.w}%` }} /></u>
              <b>{r.n}</b>
              <em>{r.l}</em>
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'practice',
    title: 'Practice from their own words',
    body: 'Flashcards and speaking tests made from the vocabulary that came up in the hour.',
    // Side by side, not stacked: a flashcard over a question was taller than
    // the screen it sits in and got clipped at the shorter canvas.
    art: (
      <div className="k-ac-screen">
        <div className="k-ac-practice">
          <div className="k-ac-card">
            <span className="k-ac-lvl">N5</span>
            <b className="jp">けど</b>
            <em>kedo</em>
            <p>but, although</p>
          </div>
          <div className="k-ac-q">
            <small>WHICH ONE CONTRASTS TWO IDEAS?</small>
            <span>駅は近いです。</span>
            <span className="right">近いけど、静かです。 <i>✓</i></span>
            <span>静かですか。</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'portal',
    title: 'A student portal with your name on it',
    body: 'Your colours, your wording, and only the sections you teach with.',
    art: (
      <div className="k-ac-screen">
        <div className="k-ac-top">
          <span><small>Welcome back,</small><b>Derek</b></span>
          <span className="k-ac-mark">📚 Sakura Japanese</span>
        </div>
        <div className="k-ac-tabs"><span className="on">Overview</span><span>Lessons</span><span>Progress</span><span>Tests</span></div>
        <div className="k-ac-stats">
          <div style={{ ['--s' as any]: '#f0b429' }}><small>Lessons</small><b>12</b></div>
          <div style={{ ['--s' as any]: '#0a61c9' }}><small>Avg score</small><b>7.4</b></div>
          <div style={{ ['--s' as any]: '#8b5cf6' }}><small>Speaking</small><b>41%</b></div>
        </div>
      </div>
    ),
  },
]

export default function AuthAside({ headline, sub }: { headline: string; sub: string }) {
  const [i, setI] = useState(0)
  /** Paused while the pointer is on it — reading a slide should not be a race. */
  const [held, setHeld] = useState(false)
  const tick = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    // Someone who has asked the OS to stop things moving gets the first slide
    // and a set of dots, not a carousel.
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (still || held) return
    tick.current = setInterval(() => setI((n) => (n + 1) % SLIDES.length), HOLD_MS)
    return () => { if (tick.current) clearInterval(tick.current) }
  }, [held])

  return (
    <aside className="k-auth-side">
      <div className="k-auth-art" aria-hidden>
        <span className="k-orb" style={{ width: 116, height: 116, right: '-3%', top: '-3%' }} />
        <span className="k-ring" style={{ width: 44, height: 44, left: '7%', top: '7%' }} />
        <span className="k-crystal" style={{ width: 56, height: 66, right: '9%', bottom: '6%', top: 'auto' }} />
      </div>

      <div className="k-auth-copy">
        <h2>{headline}</h2>
        <p>{sub}</p>

        <div
          className="k-ac"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
        >
          <div className="k-ac-stage">
            {SLIDES.map((s, n) => (
              <div key={s.id} className={`k-ac-slide ${n === i ? 'on' : ''}`} aria-hidden={n !== i}>
                {s.art}
              </div>
            ))}
          </div>

          <div className="k-ac-cap" key={SLIDES[i].id}>
            <b>{SLIDES[i].title}</b>
            <small>{SLIDES[i].body}</small>
          </div>

          <div className="k-ac-dots" role="tablist" aria-label="Product features">
            {SLIDES.map((s, n) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={n === i}
                aria-label={s.title}
                className={n === i ? 'on' : ''}
                onClick={() => setI(n)}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
