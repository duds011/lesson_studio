'use client'

/**
 * The whole roster, one measure at a time.
 *
 * Six charts stacked down a page is six things to scroll past to compare two.
 * So there is one chart, and you page through the measures — which also lets
 * the panel below answer the second question every ranking provokes: fine,
 * but is that student going up or down? The bars say where everyone stands
 * today; the cards under them say how each of them got there.
 *
 * Both halves read the same selected measure, so the page never shows a
 * ranking of one thing above a history of another.
 */

import { useState } from 'react'
import { Bar, BarChart, Cell, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

/** One lesson, every measure taken from it. */
export type LessonPoint = {
  n: number
  score: number | null
  talk: number | null
  wpm: number | null
  think: number | null
  turnWords: number | null
  fillers: number | null
}

export type StudentAnalytics = {
  id: string
  name: string
  points: LessonPoint[]
  vocab: number
  daysSinceLast: number | null
}

type MetricKey = keyof Omit<LessonPoint, 'n'>

const METRICS: {
  key: MetricKey
  label: string
  sub: string
  unit: string
  domain?: [number, number]
  decimals?: number
  lowerIsBetter?: boolean
}[] = [
  { key: 'score', label: 'Average score', sub: 'Out of 10, across every scored lesson.', unit: ' / 10', domain: [0, 10], decimals: 1 },
  { key: 'talk', label: 'Talk share', sub: 'How much of the lesson the student was the one speaking.', unit: '% of the lesson', domain: [0, 100] },
  { key: 'wpm', label: 'Speaking pace', sub: 'Words a minute while they were talking. Rising over time is fluency.', unit: ' words / min' },
  { key: 'think', label: 'Thinking time', sub: 'Seconds between you finishing and them starting. A long pause is where the work happens, not a fault.', unit: 's before replying', decimals: 1, lowerIsBetter: true },
  { key: 'turnWords', label: 'Words per turn', sub: 'How much they say each time they speak. Short turns at a quick pace is answering, not conversing.', unit: ' words a turn' },
  { key: 'fillers', label: 'Filler words', sub: 'Ums and ahs per lesson. Worth reading beside pace — fast and full of fillers is a different problem from slow and clean.', unit: ' per lesson', lowerIsBetter: true },
]

/**
 * A colour each, held across both halves of the panel.
 *
 * Keyed on position in the roster rather than on the chart's sort order, so a
 * student keeps their colour when the ranking reshuffles between measures —
 * that is what makes them followable from the bars down to their own card.
 */
const PALETTE = [
  '#f2453d', '#1f7ae0', '#12b39b', '#c83fd6', '#f2a20c',
  '#7c5cd6', '#e8447f', '#2fa855', '#f26d21', '#3fb6e8',
  '#9c6ade', '#d94a8c', '#27a3a3', '#e05252', '#5b8def',
]
const colourOf = (i: number) => PALETTE[i % PALETTE.length]

const AXIS = { fontSize: 10, fill: 'var(--muted)', fontWeight: 700 }

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
const valuesOf = (s: StudentAnalytics, k: MetricKey) =>
  s.points.map((p) => p[k]).filter((v): v is number => v != null)

function Tip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 9, boxShadow: 'var(--shadow)', padding: '6px 10px', fontSize: 11, lineHeight: 1.45 }}>
      <div style={{ color: 'var(--muted)', fontWeight: 700 }}>{label}</div>
      <div style={{ color: 'var(--ink)', fontWeight: 800 }}>{payload[0].value}{unit}</div>
    </div>
  )
}

/** One student's own history of the selected measure. */
function TrendCard({
  student, colour, metric,
}: {
  student: StudentAnalytics
  colour: string
  metric: (typeof METRICS)[number]
}) {
  const pts = student.points
    .map((p) => ({ n: p.n, v: p[metric.key] }))
    .filter((p): p is { n: number; v: number } => p.v != null)

  const avg = mean(pts.map((p) => p.v))
  const delta = pts.length > 1 ? pts[pts.length - 1].v - pts[0].v : null
  const dp = metric.decimals ?? 0
  // Down is not automatically bad: for thinking time and fillers, less is more.
  const good = delta == null ? null : metric.lowerIsBetter ? delta < 0 : delta > 0
  const flat = delta != null && Math.abs(delta) < (metric.decimals ? 0.15 : 1)

  return (
    <div className="analytics-card" style={{ padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: colour, flex: '0 0 auto' }} aria-hidden />
        <strong style={{ fontSize: 12.5, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {student.name}
        </strong>
        {delta != null && (
          <span
            style={{
              marginLeft: 'auto', fontSize: 11.5, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
              color: flat ? 'var(--muted)' : good ? 'var(--green)' : 'var(--red)',
            }}
          >
            {flat ? '▬' : good ? '▲' : '▼'} {Math.abs(delta).toFixed(dp)}
          </span>
        )}
      </div>

      <div style={{ height: 46 }}>
        {pts.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={pts} margin={{ top: 6, right: 4, bottom: 2, left: 4 }}>
              <Tooltip content={<Tip unit={metric.unit} />} />
              <Line type="monotone" dataKey="v" stroke={colour} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '14px 0 0', fontStyle: 'italic' }}>
            {pts.length === 1 ? 'one lesson so far' : 'not measured yet'}
          </p>
        )}
      </div>

      <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>
        {student.points.length} lesson{student.points.length === 1 ? '' : 's'}
        {avg != null && <> · avg <b style={{ color: 'var(--ink)' }}>{avg.toFixed(dp)}</b></>}
      </div>
    </div>
  )
}

export default function ClassAnalytics({ rows }: { rows: StudentAnalytics[] }) {
  const [i, setI] = useState(0)
  const metric = METRICS[i]
  const dp = metric.decimals ?? 0

  const colours = new Map(rows.map((r, idx) => [r.id, colourOf(idx)]))

  // Ranked for the bars, but a student with nothing measured is left out
  // rather than plotted at zero — they have not scored nought, they have not
  // been recorded.
  const bars = rows
    .map((r) => ({ id: r.id, name: r.name, value: mean(valuesOf(r, metric.key)) }))
    .filter((d): d is { id: string; name: string; value: number } => d.value != null)
    .sort((a, b) => (metric.lowerIsBetter ? a.value - b.value : b.value - a.value))
    .map((d) => ({ ...d, value: Number(d.value.toFixed(dp)) }))

  const classAvg = bars.length ? Number((bars.reduce((n, d) => n + d.value, 0) / bars.length).toFixed(dp)) : null

  const totalLessons = rows.reduce((n, r) => n + r.points.length, 0)
  const totalVocab = rows.reduce((n, r) => n + r.vocab, 0)
  const busiest = [...rows].sort((a, b) => b.points.length - a.points.length)[0]
  const quiet = rows.filter((r) => r.daysSinceLast != null && (r.daysSinceLast as number) >= 21)

  const step = (by: number) => setI((n) => (n + by + METRICS.length) % METRICS.length)

  const stat = (label: string, value: string, sub: string) => (
    <div>
      <div className="analytics-label">{label}</div>
      <strong style={{ fontSize: 21, display: 'block', lineHeight: 1.2 }}>{value}</strong>
      <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{sub}</span>
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section className="analytics-card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 16 }}>
          {stat('Total lessons', String(totalLessons), `across ${rows.length} students`)}
          {stat('Most active', busiest?.points.length ? busiest.name : '—', busiest?.points.length ? `${busiest.points.length} lessons` : 'nothing recorded yet')}
          {stat('Vocabulary met', String(totalVocab), 'words across all lessons')}
          {stat('Not seen lately', String(quiet.length), quiet.length ? quiet.map((q) => q.name).join(', ') : 'everyone is current')}
        </div>
      </section>

      <section className="analytics-card">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: 0, fontSize: 15, letterSpacing: '-.01em' }}>{metric.label}</h3>
            <p style={{ margin: '3px 0 0', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>{metric.sub}</p>
          </div>
          {/* Paging beats scrolling: the comparison stays in the same place on
              the page, so only the measure changes under your eye. */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <button className="k-metric-nav" onClick={() => step(-1)} aria-label="Previous measure">‹</button>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {i + 1}/{METRICS.length}
            </span>
            <button className="k-metric-nav" onClick={() => step(1)} aria-label="Next measure">›</button>
          </div>
        </div>

        {bars.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bars} margin={{ left: 0, right: 8, top: 18, bottom: 4 }}>
              <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} interval={0} />
              <YAxis domain={metric.domain ?? [0, 'auto']} width={38} tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip unit={metric.unit} />} cursor={{ fill: 'rgba(10,97,201,.05)' }} />
              {classAvg != null && (
                <ReferenceLine
                  y={classAvg}
                  stroke="var(--ink)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{ value: `class avg ${classAvg}`, position: 'insideTopRight', fontSize: 10, fontWeight: 700, fill: 'var(--muted)' }}
                />
              )}
              <Bar dataKey="value" isAnimationActive={false} radius={[7, 7, 0, 0]} maxBarSize={54}>
                {bars.map((d) => <Cell key={d.id} fill={colours.get(d.id)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
            Nothing measured for this yet — it fills in as lessons are recorded.
          </p>
        )}

        <div className="k-metric-dots" role="tablist" aria-label="Measure">
          {METRICS.map((m, n) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={n === i}
              aria-label={m.label}
              className={`k-metric-dot ${n === i ? 'sel' : ''}`}
              onClick={() => setI(n)}
            />
          ))}
        </div>
      </section>

      <section className="analytics-card">
        <h3 style={{ margin: 0, fontSize: 15, letterSpacing: '-.01em' }}>{metric.label} — each student</h3>
        <p style={{ margin: '3px 0 14px', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>
          Their own lessons in order. The arrow is first lesson to last.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
          {rows.map((r) => (
            <TrendCard key={r.id} student={r} colour={colours.get(r.id) as string} metric={metric} />
          ))}
        </div>
      </section>
    </div>
  )
}
