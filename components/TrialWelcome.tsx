'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { TOUR_EVENT, tourDoneKey } from '@/components/GuidedTour'

/**
 * The gift moment for a brand-new account: you have N recaps on us.
 *
 * Shown once per account, on the first overview visit, and only while the
 * account is a trial. It raises `data-welcome="open"` on <html> before the
 * guided tour's deferred auto-start looks, so the sequence is always
 * welcome → tour, never both at once. "Show me around" hands off to the
 * tour; "I'll explore" marks the tour done so it doesn't pounce the moment
 * the card closes (Settings can always replay it).
 */
const seenKey = (email?: string | null) => `ls.welcome.seen:${email || 'anon'}`

const SPARKS = [
  { left: '12%', top: '18%', size: 5, color: '#7cc0ff', delay: 0 },
  { left: '85%', top: '14%', size: 4, color: '#a24ee0', delay: 0.6 },
  { left: '8%', top: '68%', size: 4, color: '#f2b705', delay: 1.1 },
  { left: '90%', top: '62%', size: 6, color: '#7cc0ff', delay: 1.6 },
  { left: '76%', top: '85%', size: 4, color: '#f2b705', delay: 0.3 },
  { left: '20%', top: '88%', size: 5, color: '#a24ee0', delay: 2.0 },
]

export default function TrialWelcome({ email, freeRecaps }: { email?: string | null; freeRecaps: number }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let seen = true
    try { seen = localStorage.getItem(seenKey(email)) === '1' } catch { /* stay closed */ }
    if (!seen) {
      document.documentElement.dataset.welcome = 'open'
      setOpen(true)
    }
    return () => { delete document.documentElement.dataset.welcome }
  }, [email])

  const close = (startTour: boolean) => {
    try {
      localStorage.setItem(seenKey(email), '1')
      if (!startTour) localStorage.setItem(tourDoneKey(email), '1')
    } catch { /* still closes */ }
    delete document.documentElement.dataset.welcome
    setOpen(false)
    if (startTour) window.dispatchEvent(new Event(TOUR_EVENT))
  }

  if (!open) return null

  return (
    <div className="tw-layer" role="dialog" aria-modal="true" aria-label="Welcome to Lesson Studio">
      <div className="tw-card">
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="tw-spark"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, background: s.color, animationDelay: `${s.delay}s` }}
          />
        ))}

        <div className="tw-ring"><span className="tw-num">{freeRecaps}</span></div>
        <p className="tw-kicker">Welcome to Lesson Studio</p>
        <h2 className="tw-title">Your first {freeRecaps} recaps are on us.</h2>
        <p className="tw-sub">
          Install the recorder, teach a lesson, and watch it come back written up —
          no card, no catch. When you&rsquo;re convinced, pick a plan.
        </p>
        <div className="tw-actions">
          <button type="button" className="btn btn-primary" onClick={() => close(true)}>
            Show me around
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => close(false)}>
            I&rsquo;ll explore myself
          </button>
        </div>
        <p style={{ margin: '14px 0 0', fontSize: 12 }}>
          <Link href="/recorder" style={{ color: 'var(--muted)', fontWeight: 600 }} onClick={() => close(false)}>
            Or set up the recorder first →
          </Link>
        </p>
      </div>
    </div>
  )
}
