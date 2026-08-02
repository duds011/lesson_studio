'use client'

import { useState } from 'react'

/**
 * Month/week calendar for the student dashboard. Days that have a lesson get
 * a dot; today is filled. `lessonDates` are plain 'YYYY-MM-DD' strings — parsed
 * by hand so a UTC-vs-local shift can't move a lesson onto the wrong day.
 */

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarCard({ lessonDates }: { lessonDates: string[] }) {
  const [mode, setMode] = useState<'weekly' | 'monthly'>('monthly')

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  const marked = new Set(
    lessonDates
      .map((d) => {
        const [y, m, day] = String(d).split('-').map(Number)
        return y === year && m === month + 1 ? day : null
      })
      .filter((d): d is number => d != null)
  )

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // JS weeks start Sunday; shift so Monday is column 0.
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7

  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const visible = mode === 'weekly' ? weeks.filter((w) => w.includes(today)) : weeks

  return (
    <div className="k-card">
      <div className="k-seg" role="tablist">
        <button role="tab" aria-selected={mode === 'weekly'} className={mode === 'weekly' ? 'on' : ''} onClick={() => setMode('weekly')}>
          Weekly
        </button>
        <button role="tab" aria-selected={mode === 'monthly'} className={mode === 'monthly' ? 'on' : ''} onClick={() => setMode('monthly')}>
          Monthly
        </button>
      </div>

      <h3 className="k-cal-month">
        {MONTHS[month]} {today}
      </h3>

      <div className="k-cal-row">
        {DOW.map((d) => (
          <div key={d} className="k-cal-dow">{d}</div>
        ))}
      </div>

      {visible.map((week, wi) => (
        <div className="k-cal-row" key={wi}>
          {week.map((d, di) => (
            <div
              key={di}
              className={['k-cal-day', d == null ? 'dim' : '', d === today ? 'on' : '', d != null && marked.has(d) ? 'has' : ''].join(' ')}
              title={d != null && marked.has(d) ? `Lesson on ${MONTHS[month]} ${d}` : undefined}
            >
              {d ?? ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
