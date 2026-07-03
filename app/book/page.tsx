'use client'

import { useEffect, useState } from 'react'
import { PublicNav } from '@/components/AppNav'

type Day = { date: string; weekday: string; slots: string[] }
type SlotsResponse = { ok: boolean; tz: string; title: string; durationMin: number; days: Day[]; error?: string }

export default function BookPage() {
  const [data, setData] = useState<SlotsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{ meetUrl: string | null } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/book/slots')
      .then((r) => r.json())
      .then((d: SlotsResponse) => {
        setData(d)
        if (d.ok && d.days.length) setActiveDate(d.days[0].date)
      })
      .catch(() => setError('Could not load availability.'))
      .finally(() => setLoading(false))
  }, [])

  const tz = data?.tz ?? 'Asia/Tokyo'
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: tz })
  const fmtDateLong = (date: string) =>
    new Date(`${date}T12:00:00+09:00`).toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', timeZone: tz,
    })

  async function submit() {
    if (!picked || !name || !email) return
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: picked, name, email }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error || 'Booking failed.'); return }
      setConfirmed({ meetUrl: json.meetUrl })
    } catch {
      setError('Booking failed — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const activeDay = data?.days.find((d) => d.date === activeDate)

  return (
    <>
      <PublicNav />

      <main className="booking-shell page-fade">
        <div className="booking-intro">
          <div>
            <span className="eyebrow">Schedule a lesson</span>
            <h2 className="title">Find a time that works</h2>
            <p className="sub">Choose an available day and time. Your confirmation and meeting details will arrive by email.</p>
          </div>
          <div className="booking-duration">{data?.durationMin ?? 50} minutes · {tz.replace('_', ' ')}</div>
        </div>

        {confirmed ? (
          <div className="book-card" style={{ textAlign: 'center', margin: '0 auto' }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto .4rem', display: 'block' }} aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
            </svg>
            <h3 style={{ margin: '.4rem 0' }}>You&rsquo;re booked!</h3>
            <p className="sub">{picked && `${fmtDateLong(picked.slice(0, 10))} at ${fmtTime(picked)}`}</p>
            <p className="sub">A calendar invite is on its way to <strong>{email}</strong>.</p>
            {confirmed.meetUrl && (
              <p style={{ marginTop: '1rem' }}>
                <a className="btn btn-primary" href={confirmed.meetUrl} target="_blank" rel="noreferrer">Open meeting link</a>
              </p>
            )}
          </div>
        ) : loading ? (
          <div className="book-grid" aria-busy="true" aria-label="Loading available times">
            <div className="book-days">
              {[0, 1, 2, 3, 4].map((i) => <span key={i} className="skel" style={{ height: 46 }} />)}
            </div>
            <div>
              <div className="slot-grid">
                {Array.from({ length: 12 }).map((_, i) => <span key={i} className="skel" style={{ height: 40 }} />)}
              </div>
            </div>
          </div>
        ) : !data?.ok ? (
          <div className="empty">{data?.error || 'Availability unavailable. Is the calendar connected?'}</div>
        ) : data.days.length === 0 ? (
          <div className="empty">No open lesson times in the next {30} days.</div>
        ) : (
          <div className="book-grid">
            {/* day picker */}
            <div className="book-days">
              <div className="section-label" style={{ margin: '0 0 .6rem' }}>1 · Choose a day</div>
              {data.days.map((d) => (
                <button
                  key={d.date}
                  className={`day-btn ${activeDate === d.date ? 'sel' : ''}`}
                  onClick={() => { setActiveDate(d.date); setPicked(null) }}
                >
                  <span>{fmtDateLong(d.date)}</span>
                  <span className="day-count">{d.slots.length}</span>
                </button>
              ))}
            </div>

            {/* slots + form */}
            <div className="book-main">
              <div className="section-label" style={{ margin: '0 0 .6rem' }}>
                2 · {activeDay ? `Choose a time · ${fmtDateLong(activeDay.date)}` : 'Choose a time'}
              </div>
              <div className="slot-grid">
                {activeDay?.slots.map((s) => (
                  <button
                    key={s}
                    className={`slot ${picked === s ? 'sel' : ''}`}
                    onClick={() => setPicked(s)}
                  >
                    {fmtTime(s)}
                  </button>
                ))}
              </div>

              {picked && (
                <div className="book-card" style={{ marginTop: '1.2rem' }}>
                  <div className="section-label">3 · Your details</div>
                  <h3 style={{ margin: '.35rem 0 0' }}>Confirm {fmtTime(picked)}</h3>
                  <div className="field">
                    <label>Your name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="field">
                    <label>Your email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" type="email" />
                  </div>
                  {error && <p style={{ color: 'var(--red)', fontWeight: 600, fontSize: '.88rem' }}>{error}</p>}
                  <button className="btn btn-primary" disabled={submitting || !name || !email} onClick={submit} style={{ width: '100%', justifyContent: 'center' }}>
                    {submitting ? 'Booking…' : `Book lesson · ${fmtTime(picked)}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
