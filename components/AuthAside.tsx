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

/**
 * A bar chart of the last five lesson scores.
 *
 * Drawn against a floor rather than against zero. Real lesson scores live
 * between about 6 and 9, so measuring them from 0/10 pins every bar to roughly
 * the same height and leaves the top third of the chart permanently empty —
 * which is exactly how it looked. Starting the axis below the lowest score
 * fills the space and makes the climb legible, which is the only thing this
 * chart is here to show.
 */
function ScoreBars({ scores }: { scores: number[] }) {
  const floor = Math.min(...scores) - 1.2
  const ceil = Math.max(...scores) + 0.3
  const at = (s: number) => Math.max(12, ((s - floor) / (ceil - floor)) * 100)
  return (
    <div className="k-ac-bars">
      {scores.map((s, i) => (
        <span key={i} style={{ height: `${at(s)}%` }} className={i === scores.length - 1 ? 'now' : ''}>
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
          <p className="gap"><s>Yesterday I go to the market</s></p>
          <p className="ok">Yesterday I <b>went</b> to the market</p>
          <p className="why"><b>Past tense</b> — a finished action needs the past form.</p>
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
        <div className="k-ac-head k-ac-trim" style={{ marginTop: 12 }}><b>Vocabulary</b><span>this month</span></div>
        <div className="k-ac-words k-ac-trim">
          <span>the market <i>·</i> <em>noun</em></span>
          <span>to have to <i>·</i> <em>verb</em></span>
          <span>although <i>·</i> <em>linker</em></span>
          <span>+29 more</span>
        </div>
      </div>
    ),
  },
  {
    id: 'languages',
    title: 'Whatever language you teach',
    body: 'Japanese, French, Korean, Spanish and thirty-odd more — corrected in the language of the lesson, explained in the one your student thinks in.',
    art: (
      <div className="k-ac-screen">
        <div className="k-ac-head"><b>Languages</b><span>40+ supported</span></div>
        <div className="k-ac-langs">
          {['日本語', 'Français', 'Español', 'Deutsch', 'Italiano', 'Português',
            '한국어', '中文', 'English', 'Русский', 'Nederlands', 'Polski'].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div className="k-ac-pair">
          <div>
            <small>FRENCH LESSON</small>
            <p><s>j’avais pas des cours</s></p>
            <p className="ok">je n’avais pas <b>de</b> cours</p>
            <p className="why">After <b>pas</b>, the article becomes <b>de</b>.</p>
          </div>
          <div>
            <small>日本語のレッスン</small>
            <p><s>きのう 学校に行きます</s></p>
            <p className="ok">きのう 学校に<b>行きました</b></p>
            <p className="why">「きのう」は過去形と使います。</p>
          </div>
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
            <q>駅は近い<u>けど</u>、静かです。<b>The station is close, but it’s quiet.</b></q>
            <div className="k-ac-deck"><i /><i /><i /><span>3 of 31</span></div>
          </div>
          <div className="k-ac-q">
            <small>WHICH ONE CONTRASTS TWO IDEAS?</small>
            <span>駅は近いです。</span>
            <span className="right">近いけど、静かです。 <i>✓</i></span>
            <div className="k-ac-fill">
              <small>COMPLETE THE SENTENCE</small>
              <p>駅は近い<u>けど</u>、静かです。</p>
            </div>
            <div className="k-ac-qfoot">
              <b>Speaking test</b>
              <em>“Describe where you live.” — read it aloud, scored on the way back</em>
            </div>
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
        <div className="k-ac-lessons">
          {[
            { n: '12', t: 'Shopping and asking prices', s: '8.3' },
            { n: '11', t: 'Partitive articles', s: '7.8' },
            { n: '10', t: 'Giving directions', s: '6.9' },
          ].map((l) => (
            <span key={l.n}>
              <b>Lesson {l.n}</b>
              <em>{l.t}</em>
              <i>{l.s}</i>
            </span>
          ))}
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

          {/* One ring per slide; the active one fills over exactly HOLD_MS,
              so the fill IS the countdown to the next slide. Keyed by the
              active index so it restarts from empty on every change, and
              paused together with the rotation while the pointer holds it. */}
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
              >
                {n === i && (
                  // Keyed on `held` too: releasing the pointer restarts the
                  // interval from a full HOLD_MS, so the ring must restart
                  // from empty with it or it would finish ahead of the switch.
                  <svg key={`${i}${held ? '-held' : ''}`} viewBox="0 0 20 20" aria-hidden>
                    <circle className="k-dot-track" cx="10" cy="10" r="8" />
                    <circle
                      className="k-dot-fill"
                      cx="10"
                      cy="10"
                      r="8"
                      style={{
                        animationDuration: `${HOLD_MS}ms`,
                        animationPlayState: held ? 'paused' : 'running',
                      }}
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
