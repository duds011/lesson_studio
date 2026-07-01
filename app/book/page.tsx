'use client'

import { useEffect, useState } from 'react'

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
      <nav>
        <div className="nav-in">
          <a className="logo" href="/book">
            <span className="mark">の</span>
            <span><span className="brand-word">GENOA</span> · Book a Lesson</span>
          </a>
          <div className="nav-right">
            <a className="btn btn-ghost btn-sm" href="/">Teacher view</a>
          </div>
        </div>
      </nav>

      <main className="wrap">
        <div className="page-head">
          <div>
            <span className="eyebrow"><span className="dot" style={{ width: '.4rem', height: '.4rem', background: 'var(--brand)' }} />Student booking</span>
            <h2 className="title">Book your Japanese lesson 🇯🇵</h2>
            <p className="sub">{data?.durationMin ?? 50}-minute lesson with Noa · times shown in Japan time. You’ll get a Google Meet link and calendar invite.</p>
          </div>
        </div>

        {confirmed ? (
          <div className="book-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>🎉</div>
            <h3 style={{ margin: '.4rem 0' }}>You’re booked!</h3>
            <p className="sub">{picked && `${fmtDateLong(picked.slice(0, 10))} at ${fmtTime(picked)}`}</p>
            <p className="sub">A calendar invite is on its way to <strong>{email}</strong>.</p>
            {confirmed.meetUrl && (
              <p style={{ marginTop: '1rem' }}>
                <a className="btn btn-primary" href={confirmed.meetUrl} target="_blank" rel="noreferrer">Open Google Meet link</a>
              </p>
            )}
          </div>
        ) : loading ? (
          <div className="empty">Loading available times…</div>
        ) : !data?.ok ? (
          <div className="empty">⚠️ {data?.error || 'Availability unavailable. Is the calendar connected?'}</div>
        ) : data.days.length === 0 ? (
          <div className="empty">No open lesson times in the next {30} days.</div>
        ) : (
          <div className="book-grid">
            {/* day picker */}
            <div className="book-days">
              <div className="section-label" style={{ margin: '0 0 .6rem' }}>Pick a day</div>
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
                {activeDay ? fmtDateLong(activeDay.date) : 'Pick a day'}
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
                  <h3 style={{ marginTop: 0 }}>Confirm {fmtTime(picked)}</h3>
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
