'use client'

/**
 * Brand-themed charts shared by the real student dashboard and the miniature
 * of it in the branding studio. Each one takes an explicit height so a
 * teacher-resized block can hand its own space down, and a `compact` flag that
 * strips axes and tooltips for the preview-sized copy.
 *
 * These replace the plain fill bars the dashboard used to draw for scores,
 * milestone progress and vocabulary.
 */

import {
  Area, AreaChart, Bar, BarChart, Cell, PolarAngleAxis, RadialBar, RadialBarChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { JLPT_COLORS } from './VocabLevelBreakdown'

const AXIS = { fontSize: 10, fill: 'var(--muted)', fontWeight: 700 }

/** Shared tooltip — the portal's card look, not Recharts' default box. */
function ChartTip({ active, payload, label, suffix = '', prefix = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 9, boxShadow: 'var(--shadow)', padding: '5px 9px', fontSize: 10.5, lineHeight: 1.4 }}>
      <span style={{ color: 'var(--muted)', fontWeight: 700 }}>{prefix}{label} · </span>
      <span style={{ color: 'var(--ink)', fontWeight: 800 }}>{payload[0].value}{suffix}</span>
    </div>
  )
}

export type ScorePoint = { lesson: number; score: number }

/**
 * Recent lesson scores as bars. The most recent lesson is the accent colour at
 * full strength; older ones fade back so the latest reads first.
 */
export function ScoreTrendChart({
  points, color, height = 150, compact = false,
}: { points: ScorePoint[]; color: string; height?: number | string; compact?: boolean }) {
  if (points.length === 0) return null
  const last = points.length - 1

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={points} margin={compact ? { top: 4, right: 0, left: 0, bottom: 0 } : { top: 6, right: 4, left: -22, bottom: 0 }}>
        <XAxis
          dataKey="lesson" tickLine={false} axisLine={false} tick={compact ? false : AXIS}
          height={compact ? 0 : 18} tickFormatter={(v) => `L${v}`}
        />
        <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tick={compact ? false : AXIS} width={compact ? 0 : 30} />
        {!compact && <Tooltip cursor={{ fill: `${color}14` }} content={<ChartTip prefix="Lesson " suffix="/10" />} />}
        <Bar dataKey="score" radius={[5, 5, 2, 2]} maxBarSize={compact ? 14 : 34} isAnimationActive={!compact}>
          {points.map((p, i) => (
            <Cell key={p.lesson} fill={color} fillOpacity={i === last ? 1 : 0.42} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * Milestone progress as a radial gauge. PolarAngleAxis with a fixed 0–100
 * domain is what makes the sweep proportional to the value rather than to the
 * number of bars.
 */
export function MilestoneGauge({
  pct, color, height = 150, caption, compact = false,
}: { pct: number; color: string; height?: number | string; caption?: string; compact?: boolean }) {
  const value = Math.max(0, Math.min(100, pct))

  return (
    <div className="k-gauge" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={[{ name: 'progress', value }]}
          innerRadius="68%" outerRadius="100%"
          startAngle={90} endAngle={-270}
          barSize={compact ? 8 : 12}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            dataKey="value" cornerRadius={99} fill={color}
            background={{ fill: 'var(--surface-2)' } as any}
            isAnimationActive={!compact}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="k-gauge-mid">
        <b style={{ color }}>{Math.round(value)}%</b>
        {caption && !compact && <small>{caption}</small>}
      </div>
    </div>
  )
}

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

/** Vocabulary by JLPT level as bars, one colour per level. */
export function VocabLevelChart({
  distribution, height = 150, compact = false,
}: { distribution: Record<string, number>; height?: number | string; compact?: boolean }) {
  const data = JLPT_LEVELS
    .map((level) => ({ level, count: distribution[level] ?? 0 }))
    .filter((d) => d.count > 0)
  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={compact ? { top: 4, right: 0, left: 0, bottom: 0 } : { top: 6, right: 4, left: -24, bottom: 0 }}>
        <XAxis dataKey="level" tickLine={false} axisLine={false} tick={compact ? false : AXIS} height={compact ? 0 : 18} />
        <YAxis tickLine={false} axisLine={false} tick={compact ? false : AXIS} width={compact ? 0 : 30} allowDecimals={false} />
        {!compact && <Tooltip cursor={{ fill: 'rgba(0,0,0,.04)' }} content={<ChartTip suffix=" words" />} />}
        <Bar dataKey="count" radius={[5, 5, 2, 2]} maxBarSize={compact ? 14 : 38} isAnimationActive={!compact}>
          {data.map((d) => (
            <Cell key={d.level} fill={JLPT_COLORS[d.level] ?? 'var(--brand)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * The miniature stand-in for the full ProgressCharts grid. The real component
 * draws five sparklines; at preview size one accent-coloured area reads better
 * than five unreadable ones.
 */
export function MiniTrend({
  points, color, height = 62,
}: { points: { x: number; y: number }[]; color: string; height?: number | string }) {
  const gid = 'k-mini-trend'
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.34} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis dataKey="x" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Area
          type="monotone" dataKey="y" stroke={color} strokeWidth={2} fill={`url(#${gid})`}
          isAnimationActive={false}
          dot={{ r: 2, fill: color, stroke: '#fff', strokeWidth: 1.2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
