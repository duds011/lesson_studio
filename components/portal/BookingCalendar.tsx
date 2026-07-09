'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PaymentMethodsPanel from '@/components/portal/PaymentMethodsPanel'
import type { PaymentMethod } from '@/lib/payment-methods'

type Day = { date: string; weekday: string; slots: string[] }
type SlotsResponse = { ok: boolean; tz: string; title: string; durationMin: number; days: Day[]; error?: string }

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const pad = (n: number) => String(n).padStart(2, '0')

export default function BookingCalendar({ remaining }: { remaining: number | null }) {
  const [data, setData] = useState<SlotsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{ meetUrl: string | null; remaining: number; warn: boolean } | null>(null)
  const [payMethods, setPayMethods] = useState<PaymentMethod[]>([])
  const [error, setError] = useState('')
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null) // m = 0-indexed

  useEffect(() => {
    fetch('/api/book/slots')
      .then((r) => r.json())
      .then((d: SlotsResponse) => {
        setData(d)
        if (d.ok && d.days.length) {
          const first = d.days[0].date
          const [y, m] = first.split('-').map(Number)
          setMonth({ y, m: m - 1 })
        }
      })
      .catch(() => setError('Could not load availability.'))
      .finally(() => setLoading(false))
    fetch('/api/portal/payment-methods').then((r) => r.json()).then((d) => { if (d.ok) setPayMethods(d.methods ?? []) }).catch(() => {})
  }, [])

  const tz = data?.tz ?? 'Asia/Tokyo'
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: tz })
  const fmtDateLong = (date: string) => new Date(`${date}T12:00:00+09:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: tz })

  const dayByDate = useMemo(() => new Map((data?.days ?? []).map((d) => [d.date, d])), [data])
  const bounds = useMemo(() => {
    const dates = (data?.days ?? []).map((d) => d.date).sort()
    return { min: dates[0], max: dates[dates.length - 1] }
  }, [data])

  const monthNum = month ? month.y * 12 + month.m : 0
  const minNum = bounds.min ? Number(bounds.min.split('-')[0]) * 12 + (Number(bounds.min.split('-')[1]) - 1) : monthNum
  const maxNum = bounds.max ? Number(bounds.max.split('-')[0]) * 12 + (Number(bounds.max.split('-')[1]) - 1) : monthNum

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
    if (!picked) return
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/portal/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ start: picked }) })
      const json = await res.json()
      if (!json.ok) { setError(json.error || 'Booking failed.'); return }
      setConfirmed({ meetUrl: json.meetUrl, remaining: json.remaining, warn: json.warnOutOfCredits })
    } catch { setError('Booking failed — try again.') } finally { setSubmitting(false) }
  }

  return (
    <div className="page-fade">
      <Link href="/student/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }}>← Dashboard</Link>
      <div className="booking-intro" style={{ marginBottom: 20 }}>
        <div>
          <span className="eyebrow">Schedule a lesson</span>
          <h1 className="title" style={{ margin: '6px 0 4px' }}>Book your next lesson</h1>
          <p className="sub">Pick any open day — it books straight onto your teacher&rsquo;s calendar with a meeting link.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <div className="booking-duration">{data?.durationMin ?? 50} minutes</div>
          {remaining !== null && (
            <span className="pill" style={{ background: remaining > 0 ? 'var(--brand-soft)' : 'var(--amber-soft)', color: remaining > 0 ? 'var(--brand)' : 'var(--amber)', fontWeight: 700 }}>
              {remaining > 0 ? `${remaining} lesson${remaining === 1 ? '' : 's'} you can book` : 'No prepaid lessons left'}
            </span>
          )}
        </div>
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
      ) : data.days.length === 0 || !month ? (
        <div className="empty">No open lesson times in the next 30 days.</div>
      ) : (
        <div className="booking-layout">
          {/* Month calendar */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="section-label" style={{ margin: 0 }}>1 · Choose a day</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button className="btn btn-ghost btn-sm" disabled={monthNum <= minNum} onClick={() => setMonth((mo) => mo && (mo.m === 0 ? { y: mo.y - 1, m: 11 } : { y: mo.y, m: mo.m - 1 }))} aria-label="Previous month">‹</button>
                <strong style={{ fontSize: 14, minWidth: 120, textAlign: 'center' }}>{MONTHS[month.m]} {month.y}</strong>
                <button className="btn btn-ghost btn-sm" disabled={monthNum >= maxNum} onClick={() => setMonth((mo) => mo && (mo.m === 11 ? { y: mo.y + 1, m: 0 } : { y: mo.y, m: mo.m + 1 }))} aria-label="Next month">›</button>
              </div>
            </div>
            <div className="analytics-card" style={{ padding: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {DOW.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--muted)', padding: '2px 0' }}>{d}</div>)}
                {grid.map((date, i) => {
                  if (!date) return <div key={i} />
                  const day = dayByDate.get(date)
                  const has = !!day && day.slots.length > 0
                  const sel = activeDate === date
                  const dayNum = Number(date.split('-')[2])
                  return (
                    <button key={i} disabled={!has} onClick={() => { setActiveDate(date); setPicked(null) }}
                      style={{
                        aspectRatio: '1', border: sel ? '2px solid var(--brand)' : '1px solid var(--line)', borderRadius: 9,
                        background: sel ? 'var(--brand)' : has ? 'var(--brand-soft)' : '#fff',
                        color: sel ? '#fff' : has ? 'var(--brand)' : 'var(--line-strong,#c2c6bd)',
                        cursor: has ? 'pointer' : 'default', fontWeight: 700, fontSize: 13,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                      }}>
                      {dayNum}
                      {has && <span style={{ fontSize: 8, fontWeight: 600, color: sel ? '#fff' : 'var(--muted)' }}>{day!.slots.length}</span>}
                    </button>
                  )
                })}
              </div>
              <p style={{ fontSize: 10.5, color: 'var(--muted)', margin: '10px 2px 0', textAlign: 'center' }}>Highlighted days have open times — the small number is how many.</p>
            </div>
          </div>

          {/* Times for the chosen day */}
          <div className="book-main" style={{ border: '1px solid var(--line)', borderRadius: 16 }}>
            <div className="section-label" style={{ margin: '0 0 .6rem' }}>2 · {activeDay ? `Choose a time · ${fmtDateLong(activeDay.date)}` : 'Choose a time'}</div>
            {!activeDay ? (
              <div className="empty" style={{ marginTop: 0 }}>Pick a highlighted day to see open times.</div>
            ) : (
              <>
                <div className="slot-grid">
                  {activeDay.slots.map((s) => (
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
