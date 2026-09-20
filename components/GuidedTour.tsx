'use client'

import { useT } from '@/components/I18nProvider'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  TOUR_DID_EVENT, TOUR_EVENT, TOUR_STEPS, tourAtKey, tourDoneKey,
} from '@/lib/tour'

// Re-exported so the two things that start the tour — Settings' replay button
// and the trial welcome — keep importing it from here.
export { TOUR_EVENT, tourDoneKey }

const PAD = 8 // breathing room around the spotlit element

/**
 * The walkthrough: one control at a time, everything else dimmed, and it waits
 * for the teacher to use the control rather than to press Next. What the steps
 * are and why is in lib/tour.
 *
 * Two things about how it is mounted, both of which were bugs.
 *
 * It hangs off AppNav, which is rendered by the teacher layout on /teacher/*
 * and separately by / and /settings. Moving between those remounts this
 * component. With the step in useState that meant the tour restarted from the
 * beginning every time the teacher changed tab — and during a transition Next
 * keeps the old page mounted while the new one loads, so for a moment there
 * were two of these on screen drawing two cards. Hence: the step lives in
 * localStorage so a remount resumes, and a claim on <html> means only one
 * instance paints. Both are cheap; the alternative was hoisting the tour out
 * of the nav that owns its anchors.
 */
export default function GuidedTour({ email }: { email?: string | null }) {
  const t = useT()
  const pathname = usePathname()
  const [step, setStep] = useState(-1) // -1 = closed
  const [rect, setRect] = useState<DOMRect | null>(null)
  /**
   * Whether THIS instance is the one allowed to draw.
   *
   * Claimed on <html> rather than in a module variable: two instances can be
   * mounted from two different page trees, and a module variable would be
   * shared between them with no way to tell who released it.
   */
  const [owner, setOwner] = useState(false)
  const ownerRef = useRef(false)

  useEffect(() => {
    const root = document.documentElement
    if (root.dataset.tourMounted === '1') return
    root.dataset.tourMounted = '1'
    ownerRef.current = true
    setOwner(true)
    return () => {
      if (!ownerRef.current) return
      delete root.dataset.tourMounted
      ownerRef.current = false
    }
  }, [])

  /** Remember where we are, so a route change does not start the tour over. */
  const remember = useCallback((i: number) => {
    try {
      if (i < 0) localStorage.removeItem(tourAtKey(email))
      else localStorage.setItem(tourAtKey(email), String(i))
    } catch { /* private window — the tour just will not resume */ }
  }, [email])

  const go = useCallback((i: number) => { setStep(i); remember(i); setRect(null) }, [remember])

  const finish = useCallback(() => {
    try {
      localStorage.setItem(tourDoneKey(email), '1')
      localStorage.removeItem(tourAtKey(email))
    } catch { /* still closes */ }
    setStep(-1)
    setRect(null)
  }, [email])

  // Start, resume, or replay.
  useEffect(() => {
    if (!owner) return
    const start = () => { setRect(null); go(0) }

    let done = false
    let at = -1
    try {
      done = localStorage.getItem(tourDoneKey(email)) === '1'
      const raw = localStorage.getItem(tourAtKey(email))
      at = raw == null ? -1 : Number(raw)
    } catch { done = true }

    // Mid-tour already: pick it up where it was left, with no delay and no
    // second look at the welcome — that decision was made when it started.
    if (!done && at >= 0 && at < TOUR_STEPS.length) setStep(at)

    // Deferred one tick so TrialWelcome (mounted later in the tree) gets to
    // raise its flag first — a new account meets the welcome, THEN the tour.
    const timer = setTimeout(() => {
      if (done || at >= 0) return
      if (document.documentElement.dataset.welcome !== 'open') start()
    }, 400)

    window.addEventListener(TOUR_EVENT, start)
    return () => { clearTimeout(timer); window.removeEventListener(TOUR_EVENT, start) }
  }, [owner, email, go])

  /**
   * Find the step's element and measure it, waiting for it to arrive.
   *
   * Every step after the first points at something on a page the teacher has
   * not opened yet, so the element is genuinely absent for a moment — and a
   * dialog's card does not exist until the dialog is opened. Polling rather
   * than a MutationObserver because the answer is also "has it moved", which
   * an observer does not tell you.
   */
  useEffect(() => {
    if (!owner || step < 0) return
    const s = TOUR_STEPS[step]
    if (!s) return

    const look = () => {
      const el = document.querySelector(`[data-tour="${s.target}"]`)
      const box = el ? (el as HTMLElement).getBoundingClientRect() : null
      setRect(box && box.width > 0 ? box : null)
    }

    /**
     * No timeout on the wait, deliberately.
     *
     * The obvious version gives up after a while and closes the tour, which
     * punishes a teacher for wandering off to look at Settings for ten
     * seconds: they come back and the walkthrough has decided they were done.
     * There is nothing to protect against by closing — with no rect this
     * renders null, so an absent anchor already means an untouched page rather
     * than a dark screen. So it just keeps looking, and picks the teacher back
     * up when they return to where the step is. Skip is the way out.
     */
    look()
    const poll = setInterval(look, 120)
    window.addEventListener('resize', look)
    window.addEventListener('scroll', look, true)
    return () => {
      clearInterval(poll)
      window.removeEventListener('resize', look)
      window.removeEventListener('scroll', look, true)
    }
  }, [owner, step])

  /** Step ends when the teacher arrives on the page it was pointing at. */
  useEffect(() => {
    if (!owner || step < 0) return
    const until = TOUR_STEPS[step]?.until
    if (until?.kind !== 'route') return
    if (pathname?.startsWith(until.value)) go(step + 1 < TOUR_STEPS.length ? step + 1 : -1)
  }, [owner, step, pathname, go])

  /** …or when they do the thing it was pointing at. */
  useEffect(() => {
    if (!owner || step < 0) return
    const until = TOUR_STEPS[step]?.until
    if (until?.kind !== 'event') return
    const onDid = (e: Event) => {
      if ((e as CustomEvent).detail !== until.value) return
      if (step + 1 < TOUR_STEPS.length) go(step + 1)
      else finish()
    }
    window.addEventListener(TOUR_DID_EVENT, onDid)
    return () => window.removeEventListener(TOUR_DID_EVENT, onDid)
  }, [owner, step, go, finish])

  if (!owner || step < 0 || !rect) return null

  const s = TOUR_STEPS[step]
  const words = t.tour.steps[step]
  const isLast = step === TOUR_STEPS.length - 1
  // Only a step with nothing to do gets a way forward. The rest are waiting on
  // the teacher doing the thing, and a Next button beside it is a second door.
  const waiting = Boolean(s.until)
  // Back only through the part that is just description. Once the walkthrough
  // has started asking for things, stepping back would mean undoing them.
  const canGoBack = step > 0 && !waiting && !TOUR_STEPS[step - 1]?.until

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
    <div className="tour-layer" role="dialog" aria-modal="true" aria-label={words.title}>
      {/* The hole: one element whose enormous shadow is the dark backdrop.
          pointer-events are off in CSS, so the control underneath is still
          usable — which is the whole point of a tour you do rather than read. */}
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
        <span className="tour-count">{step + 1} / {TOUR_STEPS.length}</span>
        <h3>{words.title}</h3>
        <p>{words.body}</p>
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={finish}>{t.tour.skip}</button>
          {waiting ? (
            // Not a button: it is the tour saying it is watching, so the
            // teacher knows the screen is waiting on them and not stuck.
            <span className="tour-wait">{words.wait}</span>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              {canGoBack && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(step - 1)}>
                  {t.common.back}
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => (isLast ? finish() : go(step + 1))}
              >
                {isLast ? t.common.done : t.common.next}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
