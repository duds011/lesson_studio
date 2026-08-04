'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

export type PillarLesson = {
  id: string
  number: number
  title: string
  meta: string
  score: number | null
  tag: string
}

/**
 * The lesson list as a drum: a column of cards, earliest first, rolling under
 * a reading line. The card on the line is at full size; the ones that pass
 * above it shrink, fade and tip away. Scroll-snap parks a card on the line
 * rather than between two.
 *
 * The transform is recomputed from the scroll position rather than toggled by
 * an observer: a card halfway past should look halfway past.
 */
export default function LessonPillar({ lessons }: { lessons: PillarLesson[] }) {
  const [active, setActive] = useState(0)
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const paint = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const box = scroller.getBoundingClientRect()
    // The reading line sits where the first card rests — its own top padding,
    // which is also its scroll-padding, so a snapped card lands exactly on it.
    // Cards below the line are still to come; cards that pass above it roll
    // away over the top edge.
    const line = box.top + (parseFloat(getComputedStyle(scroller).paddingTop) || 0)
    let current = scroller.children.length - 1

    Array.from(scroller.children).forEach((node, i) => {
      const card = node as HTMLElement
      const r = card.getBoundingClientRect()
      const gap = (r.top - line) / box.height
      // How far the card has rolled past the line, and how far it still is
      // from reaching it. Both are clamped, so a long list doesn't end up with
      // cards folded flat at the bottom.
      const past = gap < 0 ? Math.min(1, -gap * 2.4) : 0
      const ahead = gap > 0 ? Math.min(1, gap * 1.1) : 0
      // Transform only — nothing here changes layout, so the scroll never
      // fights a reflow.
      card.style.setProperty('--roll-scale', String(1 - past * 0.22 - ahead * 0.06))
      card.style.setProperty('--roll-tilt', `${-past * 26}deg`)
      card.style.setProperty('--roll-fade', String(1 - past * 0.72 - ahead * 0.18))
      // The open card is the first one that has not yet rolled past.
      if (r.bottom > line + 8 && i < current) current = i
    })
    setActive(current)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    // Painted straight from the scroll event rather than through rAF: scroll
    // events are already frame-aligned, and a frame of lag is visible when the
    // cards are meant to track the drum exactly.
    paint()
    scroller.addEventListener('scroll', paint, { passive: true })
    window.addEventListener('resize', paint)
    return () => {
      scroller.removeEventListener('scroll', paint)
      window.removeEventListener('resize', paint)
    }
  }, [paint, lessons.length])

  if (lessons.length === 0) {
    return (
      <div className="k-empty">
        <strong style={{ color: 'var(--ink)' }}>No lessons yet</strong>
        <br />
        Your lessons will appear here once your teacher publishes them.
      </div>
    )
  }

  return (
    <div className="k-pillar">
      <div className="k-pillar-scroll" ref={scrollerRef}>
        {lessons.map((l, i) => (
          <Link
            key={l.id}
            href={`/student/lessons/${l.id}`}
            className={`k-pillar-card ${i === active ? 'on' : ''}`}
            onFocus={() => setActive(i)}
          >
            <span className="k-pillar-num">{l.tag}</span>
            <span className="k-pillar-title">{l.title}</span>
            <span className="k-pillar-meta">{l.meta}</span>
            {l.score != null && (
              <span className="k-pillar-foot">
                <span className="k-hw-track"><i style={{ width: `${Math.round((l.score / 10) * 100)}%` }} /></span>
                <b>{l.score}/10</b>
              </span>
            )}
            <span className="k-pillar-go">Open recap →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
