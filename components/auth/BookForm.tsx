'use client'

import { useT } from '@/components/I18nProvider'
import { fill, rich } from '@/lib/i18n'
import { useEffect, useMemo, useState } from 'react'
import { PublicNav } from '@/components/AppNav'

type Day = { date: string; weekday: string; slots: string[] }
type SlotsResponse = { ok: boolean; tz: string; title: string; durationMin: number; days: Day[]; error?: string }

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n: number) => String(n).padStart(2, '0')

export default function BookForm() {
  const t = useT()
  const [data, setData] = useState<SlotsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{ meetUrl: string | null } | null>(null)
  const [error, setError] = useState('')
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null) // m is 0-indexed

  useEffect(() => {
    const teacherId = new URLSearchParams(window.location.search).get('t')
    fetch(`/api/book/slots${teacherId ? `?t=${encodeURIComponent(teacherId)}` : ''}`)
      .then((r) => r.json())
      .then((d: SlotsResponse) => {
        setData(d)
        if (d.ok && d.days?.length) {
          const first = d.days[0].date
          const [y, m] = first.split('-').map(Number)
          setMonth({ y, m: m - 1 })
        }
      })
      .catch(() => setError(t.book.loadFailed))
      .finally(() => setLoading(false))
  }, [])

  const tz = data?.tz ?? 'Asia/Tokyo'
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: tz })
  const fmtDateLong = (date: string) =>
    new Date(`${date}T12:00:00+09:00`).toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', timeZone: tz,
    })

  // Availability keyed by date, plus the range of months worth showing.
  const dayByDate = useMemo(() => new Map((data?.days ?? []).map((d) => [d.date, d])), [data])
  const bounds = useMemo(() => {
    const dates = (data?.days ?? []).map((d) => d.date).sort()
    return { min: dates[0], max: dates[dates.length - 1] }
  }, [data])

  const monthNum = month ? month.y * 12 + month.m : 0
  const minNum = bounds.min ? Number(bounds.min.split('-')[0]) * 12 + (Number(bounds.min.split('-')[1]) - 1) : monthNum
  const maxNum = bounds.max ? Number(bounds.max.split('-')[0]) * 12 + (Number(bounds.max.split('-')[1]) - 1) : monthNum

  // A real month grid: leading blanks so the 1st lands on its weekday.
  const grid = useMemo(() => {
    if (!month) return []
    const { y, m } = month
    const firstWeekday = new Date(Date.UTC(y, m, 1)).getUTCDay()
    const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
    const cells: (string | null)[] = Array.from({ length: firstWeekday }, () => null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(`${y}-${pad(m + 1)}-${pad(d)}`)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [month])

  const activeDay = activeDate ? dayByDate.get(activeDate) : undefined

  async function submit() {
    if (!picked || !name || !email) return
    setSubmitting(true); setError('')
    try {
      const teacherId = new URLSearchParams(window.location.search).get('t')
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: picked, name, email, teacherId: teacherId ?? undefined }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error || t.book.bookingFailed); return }
      setConfirmed({ meetUrl: json.meetUrl })
    } catch {
      setError(t.book.bookingFailedRetry)
    } finally {
      setSubmitting(false)
    }
  }

  const stepMonth = (delta: number) =>
    setMonth((mo) => {
      if (!mo) return mo
      const next = mo.m + delta
      if (next < 0) return { y: mo.y - 1, m: 11 }
      if (next > 11) return { y: mo.y + 1, m: 0 }
      return { y: mo.y, m: next }
    })

  return (
    <>
      <PublicNav />

      <main className="booking-shell page-fade k-scope">
        <div className="booking-intro">
          <div>
            <span className="eyebrow">{t.book.eyebrow}</span>
            <h2 className="title">{t.book.title}</h2>
            <p className="sub">{t.book.sub}</p>
          </div>
          <div className="booking-duration">{data?.durationMin ?? 50} minutes · {tz.replace('_', ' ')}</div>
        </div>

        {confirmed ? (
          <div className="book-card" style={{ textAlign: 'center', margin: '0 auto', maxWidth: 460 }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto .4rem', display: 'block' }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
            </svg>
            <h3 style={{ margin: '.4rem 0' }}>{t.book.booked}</h3>
            <p className="sub">{picked && `${fmtDateLong(picked.slice(0, 10))} at ${fmtTime(picked)}`}</p>
            <p className="sub">{rich(t.book.invite, { email: <strong>{email}</strong> })}</p>
            {confirmed.meetUrl && (
              <p style={{ marginTop: '1rem' }}>
                <a className="btn btn-primary" href={confirmed.meetUrl} target="_blank" rel="noreferrer">{t.book.openMeeting}</a>
              </p>
            )}
          </div>
        ) : loading ? (
          <div className="k-book-grid" aria-busy="true" aria-label="Loading available times">
            <div className="k-cal-card"><span className="skel" style={{ height: 300, display: 'block', borderRadius: 14 }} /></div>
            <div className="book-main"><span className="skel" style={{ height: 220, display: 'block', borderRadius: 14 }} /></div>
          </div>
        ) : !data?.ok ? (
          <div className="empty">{data?.error || t.book.noCalendar}</div>
        ) : (data.days?.length ?? 0) === 0 ? (
          <div className="empty">{t.book.noTimes}</div>
        ) : (
          <div className="k-book-grid">
            {/* ── month calendar ── */}
            <div className="k-cal-card">
              <div className="k-cal-head">
                <button
                  type="button"
                  className="k-cal-nav"
                  disabled={monthNum <= minNum}
                  onClick={() => stepMonth(-1)}
                  aria-label="Previous month"
                >‹</button>
                <strong>{month ? `${t.book.months[month.m]} ${month.y}` : ''}</strong>
                <button
                  type="button"
                  className="k-cal-nav"
                  disabled={monthNum >= maxNum}
                  onClick={() => stepMonth(1)}
                  aria-label="Next month"
                >›</button>
              </div>

              <div className="k-cal-dows">
                {DOW.map((d) => <span key={d}>{d}</span>)}
              </div>

              <div className="k-cal-grid">
                {grid.map((date, i) => {
                  if (!date) return <span key={`b${i}`} className="k-cal-cell empty" />
                  const day = dayByDate.get(date)
                  const open = (day?.slots.length ?? 0) > 0
                  const sel = activeDate === date
                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={!open}
                      className={`k-cal-cell ${open ? 'open' : ''} ${sel ? 'sel' : ''}`}
                      onClick={() => { setActiveDate(date); setPicked(null) }}
                      aria-label={`${fmtDateLong(date)}${open ? `, ${day!.slots.length} times available` : ', no times'}`}
                    >
                      {Number(date.slice(-2))}
                      {open && <i aria-hidden />}
                    </button>
                  )
                })}
              </div>

              <p className="k-cal-legend"><i aria-hidden /> days with open times</p>
            </div>

            {/* ── times for the chosen day ── */}
            <div className="book-main">
              {!activeDay ? (
                <div className="k-slot-empty">
                  <strong>{t.book.pickDay}</strong>
                  <span>{t.book.pickDayHint}</span>
                </div>
              ) : (
                <>
                  <div className="k-slot-head">
                    <strong>{fmtDateLong(activeDay.date)}</strong>
                    <span>{activeDay.slots.length} time{activeDay.slots.length === 1 ? '' : 's'}</span>
                  </div>

                  <div className="slot-grid">
                    {activeDay.slots.map((s) => (
                      <button key={s} type="button" className={`slot ${picked === s ? 'sel' : ''}`} onClick={() => setPicked(s)}>
                        {fmtTime(s)}
                      </button>
                    ))}
                  </div>

                  {picked && (
                    <div className="k-book-form">
                      <div className="section-label">{t.book.yourDetails}</div>
                      <h3 style={{ margin: '.35rem 0 .8rem' }}>{fill(t.book.confirmAt, { time: fmtTime(picked) })}</h3>
                      <div className="field">
                        <label>{t.book.yourName}</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.book.namePlaceholder} />
                      </div>
                      <div className="field">
                        <label>{t.book.yourEmail}</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.book.emailPlaceholder} type="email" />
                      </div>
                      {error && <p style={{ color: 'var(--red)', fontWeight: 600, fontSize: '.88rem' }}>{error}</p>}
                      <button className="btn btn-primary" disabled={submitting || !name || !email} onClick={submit} style={{ width: '100%', justifyContent: 'center' }}>
                        {submitting ? t.book.booking : fill(t.book.bookAt, { time: fmtTime(picked) })}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
