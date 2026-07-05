'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PaymentMethodsPanel from '@/components/portal/PaymentMethodsPanel'
import type { PaymentMethod } from '@/lib/payment-methods'

type Day = { date: string; weekday: string; slots: string[] }
type SlotsResponse = { ok: boolean; tz: string; title: string; durationMin: number; days: Day[]; error?: string }

export default function StudentBookPage() {
  const [data, setData] = useState<SlotsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{ meetUrl: string | null; remaining: number; warn: boolean } | null>(null)
  const [payMethods, setPayMethods] = useState<PaymentMethod[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/book/slots')
      .then((r) => r.json())
      .then((d: SlotsResponse) => { setData(d); if (d.ok && d.days.length) setActiveDate(d.days[0].date) })
      .catch(() => setError('Could not load availability.'))
      .finally(() => setLoading(false))
    fetch('/api/portal/payment-methods')
      .then((r) => r.json())
      .then((d) => { if (d.ok) setPayMethods(d.methods ?? []) })
      .catch(() => {})
  }, [])

  const tz = data?.tz ?? 'Asia/Tokyo'
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: tz })
  const fmtDateLong = (date: string) => new Date(`${date}T12:00:00+09:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: tz })

  async function submit() {
    if (!picked) return
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/portal/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ start: picked }) })
      const json = await res.json()
      if (!json.ok) { setError(json.error || 'Booking failed.'); return }
      setConfirmed({ meetUrl: json.meetUrl, remaining: json.remaining, warn: json.warnOutOfCredits })
    } catch { setError('Booking failed — try again.') } finally { setSubmitting(false) }
  }

  const activeDay = data?.days.find((d) => d.date === activeDate)

  return (
    <div className="page-fade">
      <Link href="/student/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>← Dashboard</Link>
      <div className="booking-intro" style={{ marginBottom: 24 }}>
        <div>
          <span className="eyebrow">Schedule a lesson</span>
          <h1 className="title" style={{ margin: '6px 0 4px' }}>Book your next lesson</h1>
          <p className="sub">Pick any open time — it books straight onto your teacher&rsquo;s calendar with a meeting link.</p>
        </div>
        <div className="booking-duration">{data?.durationMin ?? 50} minutes</div>
      </div>

      {confirmed ? (
        <div className="book-card" style={{ maxWidth: 460 }}>
          <h3 style={{ margin: '0 0 6px' }}>✅ You&rsquo;re booked!</h3>
          <p className="sub">{picked && `${fmtDateLong(picked.slice(0, 10))} at ${fmtTime(picked)}`}</p>
          <p className="sub" style={{ marginTop: 8 }}>You have <strong>{confirmed.remaining}</strong> prepaid lesson{confirmed.remaining === 1 ? '' : 's'} remaining.</p>
          {confirmed.warn && <div className="warn-box" style={{ marginTop: 10 }}>Heads up — you&rsquo;re out of prepaid lessons. Your teacher has been notified; please arrange your next package.</div>}
          {confirmed.meetUrl && <p style={{ marginTop: 12 }}><a className="btn btn-primary" href={confirmed.meetUrl} target="_blank" rel="noreferrer">Open meeting link</a></p>}
          {payMethods.length > 0 && <div style={{ marginTop: 16 }}><PaymentMethodsPanel methods={payMethods} compact /></div>}
          <p style={{ marginTop: 12 }}><Link className="btn btn-ghost btn-sm" href="/student/dashboard">Back to dashboard</Link></p>
        </div>
      ) : loading ? (
        <div className="empty">Loading available times…</div>
      ) : !data?.ok ? (
        <div className="empty">{data?.error || 'Availability unavailable — your teacher may need to connect their calendar.'}</div>
      ) : data.days.length === 0 ? (
        <div className="empty">No open lesson times in the next {BOOKING_DAYS} days.</div>
      ) : (
        <div className="book-grid">
          <div className="book-days">
            <div className="section-label" style={{ margin: '0 0 .6rem' }}>1 · Choose a day</div>
            {data.days.map((d) => (
              <button key={d.date} className={`day-btn ${activeDate === d.date ? 'sel' : ''}`} onClick={() => { setActiveDate(d.date); setPicked(null) }}>
                <span>{fmtDateLong(d.date)}</span><span className="day-count">{d.slots.length}</span>
              </button>
            ))}
          </div>
          <div className="book-main">
            <div className="section-label" style={{ margin: '0 0 .6rem' }}>2 · {activeDay ? `Choose a time · ${fmtDateLong(activeDay.date)}` : 'Choose a time'}</div>
            <div className="slot-grid">
              {activeDay?.slots.map((s) => (
                <button key={s} className={`slot ${picked === s ? 'sel' : ''}`} onClick={() => setPicked(s)}>{fmtTime(s)}</button>
              ))}
            </div>
            {picked && (
              <div className="book-card" style={{ marginTop: '1.2rem' }}>
                <h3 style={{ margin: '0 0 4px' }}>Confirm {fmtTime(picked)}</h3>
                <p className="sub" style={{ margin: 0 }}>{fmtDateLong(picked.slice(0, 10))}</p>
                {error && <p style={{ color: 'var(--red)', fontWeight: 600, fontSize: '.88rem', marginTop: 8 }}>{error}</p>}
                <button className="btn btn-primary" disabled={submitting} onClick={submit} style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                  {submitting ? 'Booking…' : `Book lesson · ${fmtTime(picked)}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const BOOKING_DAYS = 30
