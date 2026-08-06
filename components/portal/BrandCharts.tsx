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
  Area, AreaChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { levelProgress, type Level } from '@/lib/brand'
import { levelColor, levelScale } from './VocabLevelBreakdown'

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
      <BarChart
        data={points}
        margin={compact ? { top: 4, right: 0, left: 0, bottom: 0 } : { top: 6, right: 4, left: -22, bottom: 0 }}
        barCategoryGap={1}
      >
        <XAxis
          dataKey="lesson" tickLine={false} axisLine={false} tick={compact ? false : AXIS}
          height={compact ? 0 : 18} tickFormatter={(v) => `L${v}`}
        />
        <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tick={compact ? false : AXIS} width={compact ? 0 : 30} />
        {!compact && <Tooltip cursor={{ fill: `${color}14` }} content={<ChartTip prefix="Lesson " suffix="/10" />} />}
        {/* No maxBarSize and next to no category gap: the bars butt together
            and read as one block of lessons rather than five lonely columns. */}
        <Bar dataKey="score" radius={[4, 4, 0, 0]} isAnimationActive={!compact}>
          {points.map((p, i) => (
            <Cell key={p.lesson} fill={color} fillOpacity={i === last ? 1 : 0.42} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * The milestone ladder as a filling track: one segment per level the teacher
 * set, each filling with the lessons taken towards it. Replaces the donut —
 * a bar says "3 of 5 lessons" without the student doing the arithmetic.
 */
export function MilestoneTrack({
  levels, lessonCount, color, compact = false,
}: { levels: Level[]; lessonCount: number; color: string; compact?: boolean }) {
  const { rungs } = levelProgress(levels, lessonCount)
  return (
    <div className="k-track">
      <div className="k-track-bar">
        {rungs.map((rung, i) => {
          const from = i === 0 ? 0 : rungs[i - 1].lessons
          const span = Math.max(1, rung.lessons - from)
          const fill = Math.max(0, Math.min(100, ((lessonCount - from) / span) * 100))
          return (
            <span key={`${rung.name}-${rung.lessons}`} className="k-track-seg">
              <i style={{ width: `${fill}%`, background: color }} />
            </span>
          )
        })}
      </div>
      {!compact && (
        <div className="k-track-legend">
          {rungs.map((rung) => (
            <span key={`${rung.name}-${rung.lessons}`} className={`k-track-rung ${lessonCount >= rung.lessons ? 'on' : ''}`}>
              <b>{rung.lessons}</b>
              <small title={rung.name}>{rung.name}</small>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** Vocabulary by level as bars, one colour per level. */
export function VocabLevelChart({
  distribution, height = 150, compact = false,
}: { distribution: Record<string, number>; height?: number | string; compact?: boolean }) {
  const data = levelScale(distribution)
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
            <Cell key={d.level} fill={levelColor(d.level)} />
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
