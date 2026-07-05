'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import LessonRow, { type LessonView } from '@/components/LessonRow'

type Bot = { botId: string; status: string; label: string; state: string } | null
export type CalEvent = LessonView & { attendees?: string[]; bot: Bot; recapStatus: 'draft' | 'published' | null }
type View = 'day' | 'week' | 'month' | 'list'

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Local-time date helpers (teacher operates in her own tz).
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const startOfWeek = (d: Date) => addDays(startOfDay(d), -startOfDay(d).getDay()) // Sunday
const sameYmd = (a: Date, b: Date) => ymd(a) === ymd(b)
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

function monthGrid(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const start = addDays(first, -first.getDay())
  return Array.from({ length: 42 }, (_, i) => addDays(start, i))
}

const statusDot = (e: CalEvent): { c: string; t: string } | null => {
  if (e.recapStatus === 'published') return { c: 'var(--green)', t: 'Recap published' }
  if (e.recapStatus === 'draft') return { c: 'var(--brand)', t: 'Recap draft' }
  if (e.bot?.state === 'recording') return { c: 'var(--red)', t: 'Recording' }
  if (e.bot?.state === 'joining') return { c: 'var(--amber)', t: 'Bot joining' }
  if (e.bot?.state === 'done') return { c: 'var(--brand)', t: 'Recorded' }
  return null
}

export default function TeacherCalendar({ initialLessons }: { initialLessons: CalEvent[] }) {
  const [view, setView] = useState<View>('month')
  const [anchor, setAnchor] = useState<Date>(startOfDay(new Date()))
  const [events, setEvents] = useState<CalEvent[]>(initialLessons)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<CalEvent | null>(null)

  const range = useMemo(() => {
    if (view === 'month') { const g = monthGrid(anchor); return { from: g[0], to: addDays(g[41], 1) } }
    if (view === 'week') { const s = startOfWeek(anchor); return { from: s, to: addDays(s, 7) } }
    if (view === 'day') return { from: startOfDay(anchor), to: addDays(anchor, 1) }
    return { from: startOfDay(new Date()), to: addDays(new Date(), 60) } // list
  }, [view, anchor])

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const qs = new URLSearchParams({ from: range.from.toISOString(), to: range.to.toISOString() })
      const j = await (await fetch(`/api/calendar/events?${qs}`, { cache: 'no-store' })).json()
      if (!j.ok) { setError(j.error === 'SCOPE' ? 'SCOPE' : (j.error || 'Could not load calendar')); setEvents([]); return }
      setEvents(j.lessons)
    } catch { setError('Could not load calendar') } finally { setLoading(false) }
  }, [range.from, range.to])

  useEffect(() => { load() }, [load])

  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>()
    for (const e of events) {
      const k = ymd(new Date(e.start))
      const arr = m.get(k)
      if (arr) arr.push(e); else m.set(k, [e])
    }
    Array.from(m.values()).forEach((arr) => arr.sort((a, b) => a.start.localeCompare(b.start)))
    return m
  }, [events])

  const today = startOfDay(new Date())
  const step = (dir: number) => setAnchor((a) => view === 'month' ? new Date(a.getFullYear(), a.getMonth() + dir, 1)
    : view === 'week' ? addDays(a, 7 * dir) : addDays(a, dir))

  const label = view === 'month' ? `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`
    : view === 'week' ? (() => { const s = startOfWeek(anchor); const e = addDays(s, 6); return `${MONTHS[s.getMonth()].slice(0, 3)} ${s.getDate()} – ${MONTHS[e.getMonth()].slice(0, 3)} ${e.getDate()}` })()
    : view === 'day' ? anchor.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
    : 'Upcoming'

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {view !== 'list' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setAnchor(startOfDay(new Date()))}>Today</button>
            <button className="btn btn-ghost btn-sm" onClick={() => step(-1)} aria-label="Previous">‹</button>
            <button className="btn btn-ghost btn-sm" onClick={() => step(1)} aria-label="Next">›</button>
          </div>
        )}
        <strong style={{ fontSize: 16 }}>{label}</strong>
        {loading && <span style={{ fontSize: 11, color: 'var(--muted)' }}>Loading…</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: 'var(--surface-2)', padding: 3, borderRadius: 10 }}>
          {(['day', 'week', 'month', 'list'] as View[]).map((v) => (
            <button key={v} onClick={() => setView(v)} className="btn btn-sm"
              style={{ textTransform: 'capitalize', border: 0, background: view === v ? '#fff' : 'transparent', color: view === v ? 'var(--ink)' : 'var(--muted)', boxShadow: view === v ? '0 1px 3px rgba(0,0,0,.08)' : 'none' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {error === 'SCOPE' ? (
        <div className="empty">Your Google connection needs updated permissions. <Link href="/settings" style={{ color: 'var(--brand)', fontWeight: 700 }}>Fix it in Settings</Link></div>
      ) : error ? (
        <div className="empty">{error}</div>
      ) : view === 'month' ? (
        <MonthView grid={monthGrid(anchor)} anchor={anchor} today={today} byDay={byDay} onPick={setSelected} onDay={(d) => { setAnchor(d); setView('day') }} />
      ) : view === 'week' ? (
        <WeekView days={Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(anchor), i))} today={today} byDay={byDay} onPick={setSelected} onDay={(d) => { setAnchor(d); setView('day') }} />
      ) : view === 'day' ? (
        <DayView day={anchor} events={byDay.get(ymd(anchor)) ?? []} onPick={setSelected} />
      ) : (
        <ListView byDay={byDay} today={today} />
      )}

      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

/* ── Month ── */
function MonthView({ grid, anchor, today, byDay, onPick, onDay }: {
  grid: Date[]; anchor: Date; today: Date; byDay: Map<string, CalEvent[]>; onPick: (e: CalEvent) => void; onDay: (d: Date) => void
}) {
  return (
    <div className="analytics-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))' }}>
        {DOW.map((d) => <div key={d} style={{ padding: '8px 6px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid var(--line)' }}>{d}</div>)}
        {grid.map((d, i) => {
          const inMonth = d.getMonth() === anchor.getMonth()
          const isToday = sameYmd(d, today)
          const evs = byDay.get(ymd(d)) ?? []
          return (
            <div key={i} onClick={() => onDay(d)} style={{ minHeight: 92, padding: 5, borderRight: (i % 7 !== 6) ? '1px solid var(--line)' : undefined, borderBottom: i < 35 ? '1px solid var(--line)' : undefined, background: inMonth ? '#fff' : 'var(--surface-2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 11, fontWeight: 700, alignSelf: 'flex-end', width: 20, height: 20, display: 'grid', placeItems: 'center', borderRadius: '50%', color: isToday ? '#fff' : inMonth ? 'var(--ink)' : 'var(--muted)', background: isToday ? 'var(--brand)' : 'transparent' }}>{d.getDate()}</span>
              {evs.slice(0, 3).map((e) => {
                const s = statusDot(e)
                return (
                  <button key={e.id} onClick={(ev) => { ev.stopPropagation(); onPick(e) }} title={`${fmtTime(e.start)} · ${e.title.replace(/<[^>]*>/g, '')}`}
                    style={{ textAlign: 'left', border: 0, background: 'var(--brand-soft)', color: 'var(--brand)', borderRadius: 5, padding: '2px 5px', fontSize: 10.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', minWidth: 0, maxWidth: '100%' }}>
                    {s && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.c, flexShrink: 0 }} />}
                    <span style={{ fontWeight: 700, flexShrink: 0 }}>{fmtTime(e.start)}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, fontWeight: 500 }}>{e.title.replace(/<[^>]*>/g, '')}</span>
                  </button>
                )
              })}
              {evs.length > 3 && <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, paddingLeft: 3 }}>+{evs.length - 3} more</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Week ── */
function WeekView({ days, today, byDay, onPick, onDay }: {
  days: Date[]; today: Date; byDay: Map<string, CalEvent[]>; onPick: (e: CalEvent) => void; onDay: (d: Date) => void
}) {
  return (
    <div className="analytics-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))' }}>
        {days.map((d, i) => {
          const isToday = sameYmd(d, today)
          const evs = byDay.get(ymd(d)) ?? []
          return (
            <div key={i} style={{ borderRight: i !== 6 ? '1px solid var(--line)' : undefined, minHeight: 220, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <button onClick={() => onDay(d)} style={{ border: 0, borderBottom: '1px solid var(--line)', background: isToday ? 'var(--brand-soft)' : 'var(--surface-2)', padding: '7px 4px', cursor: 'pointer' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>{DOW[d.getDay()]}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: isToday ? 'var(--brand)' : 'var(--ink)' }}>{d.getDate()}</div>
              </button>
              <div style={{ padding: 5, display: 'grid', gap: 4, alignContent: 'start' }}>
                {evs.map((e) => {
                  const s = statusDot(e)
                  return (
                    <button key={e.id} onClick={() => onPick(e)} style={{ textAlign: 'left', border: '1px solid var(--line)', background: '#fff', borderRadius: 7, padding: '5px 6px', cursor: 'pointer', display: 'grid', gap: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: 4 }}>{s && <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.c }} />}{fmtTime(e.start)}</span>
                      <span style={{ fontSize: 10.5, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title.replace(/<[^>]*>/g, '')}</span>
                    </button>
                  )
                })}
                {evs.length === 0 && <span style={{ fontSize: 10, color: 'var(--line-strong,#c9cdc4)', textAlign: 'center', paddingTop: 8 }}>—</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Day ── */
function DayView({ day, events, onPick }: { day: Date; events: CalEvent[]; onPick: (e: CalEvent) => void }) {
  if (events.length === 0) return <div className="empty"><strong>Nothing on {day.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}.</strong><br />No lessons scheduled this day.</div>
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {events.map((e) => {
        const s = statusDot(e)
        return (
          <button key={e.id} onClick={() => onPick(e)} className="analytics-card" style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}>
            <div style={{ textAlign: 'center', minWidth: 66 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--brand)' }}>{fmtTime(e.start)}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{fmtTime(e.end)}</div>
            </div>
            <div style={{ flex: 1, borderLeft: '2px solid var(--brand-soft)', paddingLeft: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }} dangerouslySetInnerHTML={{ __html: e.title }} />
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{e.meetingUrl ? e.platform === 'zoom' ? 'Zoom' : e.platform === 'meet' ? 'Google Meet' : 'Meeting link' : 'No meeting link'}</div>
            </div>
            {s && <span className="pill" style={{ background: 'var(--surface-2)', color: s.c }}><span className="dot" style={{ background: s.c }} />{s.t}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ── List (full LessonRow actions) ── */
function ListView({ byDay, today }: { byDay: Map<string, CalEvent[]>; today: Date }) {
  const keys = Array.from(byDay.keys()).sort()
  if (keys.length === 0) return <div className="empty"><strong>Your agenda is clear.</strong><br />No upcoming lessons on this calendar.</div>
  const dayLabel = (k: string) => {
    const d = new Date(`${k}T12:00:00`)
    if (sameYmd(d, today)) return 'Today'
    if (sameYmd(d, addDays(today, 1))) return 'Tomorrow'
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
  }
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {keys.map((k) => (
        <div className="day-group" key={k}>
          <div className="day-head"><span className="day-label">{dayLabel(k)}</span></div>
          {byDay.get(k)!.map((e) => (
            <LessonRow key={e.id} lesson={{ id: e.id, title: e.title, start: e.start, end: e.end, tz: e.tz, platform: e.platform, meetingUrl: e.meetingUrl }} initialBot={e.bot} initialRecapStatus={e.recapStatus} />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ── Event modal reusing LessonRow ── */
function EventModal({ event, onClose }: { event: CalEvent; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(21,23,20,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div className="surface" style={{ width: '100%', maxWidth: 560, padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <span className="eyebrow">{new Date(event.start).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <h3 style={{ margin: '2px 0 0' }} dangerouslySetInnerHTML={{ __html: event.title }} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <LessonRow lesson={{ id: event.id, title: event.title, start: event.start, end: event.end, tz: event.tz, platform: event.platform, meetingUrl: event.meetingUrl }} initialBot={event.bot} initialRecapStatus={event.recapStatus} />
      </div>
    </div>
  )
}
