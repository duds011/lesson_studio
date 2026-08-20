'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * Scoped per account, not per browser. The old browser-wide key meant that
 * finishing the tour on one account silenced it for every account ever
 * created in that browser — a brand-new teacher saw nothing.
 */
export const tourDoneKey = (email?: string | null) => `ls.tour.done:${email || 'anon'}`
/** Fired by the Settings replay button; the tour listens app-wide. */
export const TOUR_EVENT = 'ls:tour'

type Step = { target: string; title: string; body: string }

/**
 * The walkthrough: one sidebar destination at a time, everything else dimmed.
 *
 * Steps target the nav links rather than page content, deliberately — the nav
 * is on every teacher page, so the tour can start (and be replayed) anywhere,
 * and "what each window is" is literally what the sidebar lists. A step whose
 * target is missing or hidden (collapsed nav on a phone) is skipped rather
 * than spotlighting a blank patch of screen.
 */
const STEPS: Step[] = [
  {
    target: 'overview',
    title: 'Overview',
    body: 'Home base. Recaps land here for you to review, and your latest lessons stack up below them.',
  },
  {
    target: 'students',
    title: 'Students',
    body: 'Add each student here. Their lessons, tests and progress all hang off this list — and each gets a portal of their own.',
  },
  {
    target: 'notes',
    title: 'Notes',
    body: 'One click per lesson taught: a month grid that doubles as your teaching diary.',
  },
  {
    target: 'student-view',
    title: 'Student view',
    body: 'Exactly what your students see, restyled to your taste — colours, names, sections. Not a mock-up: the real thing.',
  },
  {
    target: 'payments',
    title: 'Payments',
    body: 'Log what each student paid and how many lessons it covers. The balance counts down as recaps publish.',
  },
  {
    target: 'settings',
    title: 'Settings',
    body: 'Your calendar, the lesson recorder, and your account. This tour lives here too, if you ever want it again.',
  },
]

const PAD = 8 // breathing room around the spotlit element

export default function GuidedTour({ email }: { email?: string | null }) {
  const [step, setStep] = useState(-1) // -1 = closed
  const [rect, setRect] = useState<DOMRect | null>(null)

  /** First step at or after `from` whose target actually exists and has size. */
  const nextVisible = useCallback((from: number, dir: 1 | -1 = 1) => {
    for (let i = from; i >= 0 && i < STEPS.length; i += dir) {
      const el = document.querySelector(`[data-tour="${STEPS[i].target}"]`)
      if (el && (el as HTMLElement).getBoundingClientRect().width > 0) return i
    }
    return -1
  }, [])

  const measure = useCallback((i: number) => {
    const el = document.querySelector(`[data-tour="${STEPS[i]?.target}"]`)
    if (!el) return
    el.scrollIntoView({ block: 'nearest' })
    // Synchronous, on purpose. getBoundingClientRect forces layout, so there
    // is nothing to wait a frame for — and the requestAnimationFrame this
    // used to sit in never fires in a hidden tab, which froze the tour with
    // the backdrop up and no card if the teacher switched tabs mid-step.
    setRect(el.getBoundingClientRect())
  }, [])

  // Auto-start once, and on the replay event from Settings.
  useEffect(() => {
    const start = () => {
      const first = nextVisible(0)
      if (first !== -1) setStep(first)
    }
    let seen = false
    try { seen = localStorage.getItem(tourDoneKey(email)) === '1' } catch { seen = true }
    // Deferred one tick so TrialWelcome (mounted later in the tree) gets to
    // raise its flag first — a new account meets the welcome, THEN the tour.
    const t = setTimeout(() => {
      if (!seen && document.documentElement.dataset.welcome !== 'open') start()
    }, 400)
    window.addEventListener(TOUR_EVENT, start)
    return () => { clearTimeout(t); window.removeEventListener(TOUR_EVENT, start) }
  }, [nextVisible, email])

  // The spotlight is position:fixed, so any scroll or resize desyncs it from
  // its element — remeasure rather than trying to forbid scrolling.
  useEffect(() => {
    if (step < 0) return
    measure(step)
    const sync = () => measure(step)
    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, true)
    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
    }
  }, [step, measure])

  const finish = () => {
    try { localStorage.setItem(tourDoneKey(email), '1') } catch { /* still closes */ }
    setStep(-1)
    setRect(null)
  }

  if (step < 0 || !rect) return null

  const s = STEPS[step]
  const isLast = nextVisible(step + 1) === -1
  const goNext = () => (isLast ? finish() : setStep(nextVisible(step + 1)))
  const goBack = () => { const p = nextVisible(step - 1, -1); if (p !== -1) setStep(p) }

  // Card beside the spotlight: to the right when there is room (the sidebar
  // case), otherwise below, clamped to the viewport.
  const cardW = 300
  const roomRight = window.innerWidth - rect.right - 2 * PAD
  const left = roomRight > cardW + 24
    ? rect.right + PAD + 14
    : Math.min(Math.max(12, rect.left), window.innerWidth - cardW - 12)
  const top = roomRight > cardW + 24
    ? Math.min(Math.max(12, rect.top - 8), window.innerHeight - 220)
    : Math.min(rect.bottom + PAD + 12, window.innerHeight - 220)

  return (
    <div className="tour-layer" role="dialog" aria-modal="true" aria-label={`Tour: ${s.title}`}>
      {/* The hole: one element whose enormous shadow is the dark backdrop. */}
      <div
        className="tour-spot"
        style={{
          left: rect.left - PAD,
          top: rect.top - PAD,
          width: rect.width + 2 * PAD,
          height: rect.height + 2 * PAD,
        }}
      />
      <div className="tour-card" style={{ left, top, width: cardW }}>
        <span className="tour-count">{step + 1} / {STEPS.length}</span>
        <h3>{s.title}</h3>
        <p>{s.body}</p>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={finish}>Skip tour</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {nextVisible(step - 1, -1) !== -1 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={goBack}>Back</button>
            )}
            <button type="button" className="btn btn-primary btn-sm" onClick={goNext}>
              {isLast ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
