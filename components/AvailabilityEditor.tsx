'use client'

import { useState, useTransition } from 'react'
import { saveAvailability } from '@/app/actions/availability'
import { SettingsPanel } from '@/components/SettingsTabs'
import type { BookingConfig, Range } from '@/lib/booking'

// Monday-first display order mapped to weekday indices (0=Sun … 6=Sat).
const WEEK: { idx: number; label: string }[] = [
  { idx: 1, label: 'Monday' }, { idx: 2, label: 'Tuesday' }, { idx: 3, label: 'Wednesday' },
  { idx: 4, label: 'Thursday' }, { idx: 5, label: 'Friday' }, { idx: 6, label: 'Saturday' }, { idx: 0, label: 'Sunday' },
]

const inputStyle: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px', background: '#fff', width: '100%', font: 'inherit' }

type OverrideRow = { id: string; date: string; ranges: Range[] }
const uid = () => Math.random().toString(36).slice(2, 9)

/** Time ranges for one day, laid out inline so a day is a single row. */
function RangeEditor({ ranges, onEdit, onRemove, onAdd }: {
  ranges: Range[]
  onEdit: (ri: number, w: 0 | 1, v: string) => void
  onRemove: (ri: number) => void
  onAdd: () => void
}) {
  return (
    <div className="k-ranges">
      {ranges.map((r, ri) => (
        <span className="k-time-chip" key={ri}>
          <input type="time" value={r[0]} step={300} onChange={(e) => onEdit(ri, 0, e.target.value)} aria-label="Start time" />
          <span style={{ color: 'var(--muted)' }}>–</span>
          <input type="time" value={r[1]} step={300} onChange={(e) => onEdit(ri, 1, e.target.value)} aria-label="End time" />
          <button className="k-chip-x" onClick={() => onRemove(ri)} aria-label="Remove range">✕</button>
        </span>
      ))}
      <button className="btn btn-ghost btn-sm" onClick={onAdd}>+ Add</button>
    </div>
  )
}

export default function AvailabilityEditor({ config }: { config: BookingConfig }) {
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(config.title)
  const [durationMin, setDuration] = useState(String(config.durationMin))
  const [incrementMin, setIncrement] = useState(String(config.incrementMin))
  const [minNoticeHours, setNotice] = useState(String(config.minNoticeHours))
  const [bufferBeforeMin, setBufBefore] = useState(String(config.bufferBeforeMin))
  const [bufferAfterMin, setBufAfter] = useState(String(config.bufferAfterMin))
  const [maxPerDay, setMaxPerDay] = useState(String(config.maxPerDay))
  const [daysAhead, setDaysAhead] = useState(String(config.daysAhead))

  const [weekly, setWeekly] = useState<Record<number, Range[]>>(() => {
    const w: Record<number, Range[]> = {}
    for (let d = 0; d < 7; d++) w[d] = (config.weeklyHours[d] ?? []).map((r) => [r[0], r[1]] as Range)
    return w
  })

  const [overrides, setOverrides] = useState<OverrideRow[]>(() =>
    Object.entries(config.dateOverrides ?? {}).sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, ranges]) => ({ id: uid(), date, ranges: ranges.map((r) => [r[0], r[1]] as Range) })))

  const dirty = () => { setSaved(false); setError('') }

  // Weekly helpers
  const setDayRanges = (idx: number, ranges: Range[]) => { dirty(); setWeekly((w) => ({ ...w, [idx]: ranges })) }
  const toggleDay = (idx: number, on: boolean) => setDayRanges(idx, on ? [['09:00', '17:00']] : [])
  const addRange = (idx: number) => setDayRanges(idx, [...weekly[idx], ['09:00', '17:00']])
  const editRange = (idx: number, ri: number, which: 0 | 1, val: string) =>
    setDayRanges(idx, weekly[idx].map((r, i) => i === ri ? (which === 0 ? [val, r[1]] : [r[0], val]) as Range : r))
  const removeRange = (idx: number, ri: number) => setDayRanges(idx, weekly[idx].filter((_, i) => i !== ri))
  const copyMondayToWeekdays = () => { dirty(); setWeekly((w) => ({ ...w, 2: [...w[1]], 3: [...w[1]], 4: [...w[1]], 5: [...w[1]] })) }

  // Override helpers
  const todayIso = new Date().toISOString().slice(0, 10)
  const addOverride = () => { dirty(); setOverrides((o) => [...o, { id: uid(), date: todayIso, ranges: [] }]) }
  const setOverride = (id: string, upd: Partial<OverrideRow>) => { dirty(); setOverrides((o) => o.map((r) => r.id === id ? { ...r, ...upd } : r)) }
  const removeOverride = (id: string) => { dirty(); setOverrides((o) => o.filter((r) => r.id !== id)) }

  function save() {
    setError('')
    const dateOverrides: Record<string, Range[]> = {}
    for (const o of overrides) if (o.date) dateOverrides[o.date] = o.ranges
    startTransition(async () => {
      const res = await saveAvailability({
        title, durationMin: +durationMin, incrementMin: +incrementMin, minNoticeHours: +minNoticeHours,
        bufferBeforeMin: +bufferBeforeMin, bufferAfterMin: +bufferAfterMin, maxPerDay: +maxPerDay, daysAhead: +daysAhead,
        weeklyHours: weekly, dateOverrides,
      })
      if (res.success) setSaved(true); else setError(res.error || 'Could not save')
    })
  }

  /* Both views edit the same config, so each carries the same save bar. */
  const SaveBar = (
    <div className="k-save-bar">
      {error && <span style={{ color: 'var(--red)', fontSize: 12 }}>{error}</span>}
      {saved && <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ Saved — your booking page is updated</span>}
      <button className="btn btn-primary btn-sm" disabled={pending} onClick={save}>{pending ? 'Saving…' : 'Save changes'}</button>
    </div>
  )

  return (
    <>
      {/* ── Booking preference ─────────────────────────────────────── */}
      <SettingsPanel id="booking">
        <section className="k-sec">
          <div className="k-sec-head">
            <span className="k-sec-icon p" aria-hidden>⚙️</span>
            <div>
              <h3>Lesson defaults</h3>
              <p className="desc">How long lessons are and how far ahead students can book you.</p>
            </div>
          </div>

          <div className="k-avail-grid">
            <div className="field" style={{ gridColumn: '1 / -1' }}><label>Lesson name</label><input value={title} onChange={(e) => { dirty(); setTitle(e.target.value) }} placeholder="Language lesson" style={inputStyle} /></div>
            <div className="field"><label>Lesson length (min)</label><input type="number" min="5" step="5" value={durationMin} onChange={(e) => { dirty(); setDuration(e.target.value) }} style={inputStyle} /></div>
            <div className="field"><label>Slot interval (min)</label><input type="number" min="5" step="5" value={incrementMin} onChange={(e) => { dirty(); setIncrement(e.target.value) }} style={inputStyle} /></div>
            <div className="field"><label>Min notice (hours)</label><input type="number" min="0" step="1" value={minNoticeHours} onChange={(e) => { dirty(); setNotice(e.target.value) }} style={inputStyle} /></div>
            <div className="field"><label>Buffer before (min)</label><input type="number" min="0" step="5" value={bufferBeforeMin} onChange={(e) => { dirty(); setBufBefore(e.target.value) }} style={inputStyle} /></div>
            <div className="field"><label>Buffer after (min)</label><input type="number" min="0" step="5" value={bufferAfterMin} onChange={(e) => { dirty(); setBufAfter(e.target.value) }} style={inputStyle} /></div>
            <div className="field"><label>Max lessons / day</label><input type="number" min="1" step="1" value={maxPerDay} onChange={(e) => { dirty(); setMaxPerDay(e.target.value) }} style={inputStyle} /></div>
            <div className="field"><label>Booking window (days)</label><input type="number" min="1" step="1" value={daysAhead} onChange={(e) => { dirty(); setDaysAhead(e.target.value) }} style={inputStyle} /></div>
          </div>

          {SaveBar}
        </section>
      </SettingsPanel>

      {/* ── Availability ───────────────────────────────────────────── */}
      <SettingsPanel id="availability">
        <section className="k-sec">
          <div className="k-sec-head">
            <span className="k-sec-icon p" aria-hidden>🕒</span>
            <div>
              <h3>Availability</h3>
              <p className="desc">
                When students can book you. Times are {config.tz.replace('_', ' ')}. What you set here is exactly
                what the booking page offers them.
              </p>
            </div>
            {/* The booking page is the result of this panel, so its preview
                belongs here rather than as its own item in the sidebar. */}
            <div style={{ marginLeft: 'auto', flex: '0 0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={copyMondayToWeekdays} title="Copy Monday's hours to Tue–Fri">Copy Mon → weekdays</button>
              <a className="btn btn-primary btn-sm" href="/book" target="_blank" rel="noreferrer">Preview booking page ↗</a>
            </div>
          </div>

          <div className="k-week">
            {WEEK.map(({ idx, label }) => {
              const ranges = weekly[idx]
              const on = ranges.length > 0
              return (
                <div key={idx} className="avail-row">
                  <div className="k-day-toggle">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={`${label} availability`}
                      className={`k-switch ${on ? 'on' : ''}`}
                      onClick={() => toggleDay(idx, !on)}
                    />
                    {label}
                  </div>
                  {on ? (
                    <RangeEditor ranges={ranges} onEdit={(ri, w, v) => editRange(idx, ri, w, v)} onRemove={(ri) => removeRange(idx, ri)} onAdd={() => addRange(idx)} />
                  ) : (
                    <span className="k-unavail">Unavailable</span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="k-subhead">
            <h4>Date overrides</h4>
            <span>Days off or one-off hours that replace the weekly schedule.</span>
            <button className="btn btn-ghost btn-sm" onClick={addOverride}>+ Add date</button>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {overrides.length === 0 && <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>No overrides. Add a date to block a day off or set special hours.</p>}
            {overrides.map((o) => {
              const off = o.ranges.length === 0
              return (
                <div key={o.id} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: 12, display: 'grid', gap: 10, background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <input type="date" value={o.date} onChange={(e) => setOverride(o.id, { date: e.target.value })} style={{ ...inputStyle, width: 'auto' }} />
                    <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', padding: 3, borderRadius: 8 }}>
                      <button className="btn btn-sm" style={{ border: 0, background: off ? '#fff' : 'transparent', color: off ? 'var(--red)' : 'var(--muted)' }} onClick={() => setOverride(o.id, { ranges: [] })}>Day off</button>
                      <button className="btn btn-sm" style={{ border: 0, background: !off ? '#fff' : 'transparent', color: !off ? 'var(--ink)' : 'var(--muted)' }} onClick={() => { if (off) setOverride(o.id, { ranges: [['09:00', '17:00']] }) }}>Custom hours</button>
                    </div>
                    <button className="btn btn-danger-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => removeOverride(o.id)}>Remove</button>
                  </div>
                  {!off && (
                    <RangeEditor
                      ranges={o.ranges}
                      onEdit={(ri, w, v) => setOverride(o.id, { ranges: o.ranges.map((r, i) => i === ri ? (w === 0 ? [v, r[1]] : [r[0], v]) as Range : r) })}
                      onRemove={(ri) => setOverride(o.id, { ranges: o.ranges.filter((_, i) => i !== ri) })}
                      onAdd={() => setOverride(o.id, { ranges: [...o.ranges, ['09:00', '17:00']] })}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {SaveBar}
        </section>
      </SettingsPanel>
    </>
  )
}
