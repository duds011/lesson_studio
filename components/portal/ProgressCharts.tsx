'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartLesson {
  lessonNumber: number
  score: number | null
  talkPct: number | null
  vocabCount: number
  wpm?: number | null
  responseSec?: number | null
}

interface Props {
  lessons: ChartLesson[] // descending order — we reverse for charts
}

const BRAND = '#6259e8'
const PURPLE = '#8b5cf6'
const GREEN = '#10b981'
const AMBER = '#f59e0b'
const PINK = '#ec4899'

function SparkTooltip({ active, payload, label, suffix = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 9, boxShadow: 'var(--shadow)', padding: '5px 9px', fontSize: 10.5, lineHeight: 1.4 }}>
      <span style={{ color: 'var(--muted)', fontWeight: 700 }}>L{label} · </span>
      <span style={{ color: 'var(--ink)', fontWeight: 800 }}>{payload[0].value}{suffix}</span>
    </div>
  )
}

function Spark({
  label, data, dataKey, color, suffix = '', domain, lowerIsBetter = false, format,
}: {
  label: string
  data: any[]
  dataKey: string
  color: string
  suffix?: string
  domain?: [number, number]
  lowerIsBetter?: boolean
  format?: (v: number) => string | number
  }) {
  const vals = data.map((d) => d[dataKey]).filter((v) => v != null) as number[]
  if (vals.length === 0) return null
  const latest = vals[vals.length - 1]
  const delta = vals.length > 1 ? latest - vals[0] : 0
  const improved = lowerIsBetter ? delta < 0 : delta > 0
  const fmt = format ?? ((v: number) => v)
  const gid = `spark-${dataKey}`

  return (
    <div className="spark-tile">
      <div className="spark-head">
        <span className="spark-label">{label}</span>
        <span className="spark-value" style={{ color }}>
          {fmt(latest)}<span className="spark-unit">{suffix}</span>
        </span>
      </div>
      {delta !== 0 && (
        <span className={`spark-delta ${improved ? 'up' : 'down'}`}>
          {delta > 0 ? '▲' : '▼'} {fmt(Math.abs(delta))}{suffix} since L{data[0].lessonNumber}
        </span>
      )}
      {vals.length < 2 ? (
        <div className="spark-empty">Trend appears after your next lesson</div>
      ) : (
      <div className="spark-chart">
        <ResponsiveContainer width="100%" height={56}>
          <AreaChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="lessonNumber" hide />
            <YAxis domain={domain ?? ['auto', 'auto']} hide />
            <Tooltip content={<SparkTooltip suffix={suffix} />} cursor={{ stroke: color, strokeOpacity: 0.25 }} />
            <Area
              type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
              fill={`url(#${gid})`} connectNulls
              dot={{ r: 2.5, fill: color, stroke: '#fff', strokeWidth: 1.5 }}
              activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  )
}

export default function ProgressCharts({ lessons }: Props) {
  if (lessons.length < 2) return null

  const data = [...lessons].reverse() // chronological

  let running = 0
  const withVocab = data.map((l) => {
    running += l.vocabCount
    return { ...l, cumVocab: running }
  })

  return (
    <div className="spark-grid">
      <Spark label="Score" data={withVocab} dataKey="score" color={BRAND} suffix="/10" domain={[0, 10]} format={(v) => v.toFixed(1)} />
      <Spark label="You talk" data={withVocab} dataKey="talkPct" color={PURPLE} suffix="%" domain={[0, 100]} />
      <Spark label="Pace" data={withVocab} dataKey="wpm" color={GREEN} suffix=" wpm" />
      <Spark label="Thinking" data={withVocab} dataKey="responseSec" color={AMBER} suffix="s" lowerIsBetter />
      <Spark label="Vocabulary" data={withVocab} dataKey="cumVocab" color={PINK} suffix=" words" />
    </div>
  )
}
