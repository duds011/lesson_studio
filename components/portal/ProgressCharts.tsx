'use client'

import { useState } from 'react'
import {
  ComposedChart, Bar, Line, BarChart,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface ChartLesson {
  lessonNumber: number
  score: number | null
  talkPct: number | null
  vocabCount: number
}

interface Props {
  lessons: ChartLesson[] // descending order — we reverse for charts
}

const BRAND = '#6259e8'
const PURPLE = '#8b5cf6'

function CustomTooltip({ active, payload, label, suffix = '', label2 = '' }: any) {
  if (!active || !payload?.length) return null
  const val = payload.find((p: any) => p.type === 'bar')?.value ?? payload[0]?.value
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 11, boxShadow: 'var(--shadow)', padding: '8px 11px', fontSize: 11 }}>
      <p style={{ color: 'var(--muted)', margin: '0 0 3px', fontWeight: 700 }}>Lesson {label}</p>
      <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 800 }}>{val}{suffix} {label2}</p>
    </div>
  )
}

export default function ProgressCharts({ lessons }: Props) {
  const [open, setOpen] = useState(true)

  if (lessons.length < 2) return null

  const data = [...lessons].reverse() // chronological

  let running = 0
  const vocabData = data.map((l) => {
    running += l.vocabCount
    return { lessonNumber: l.lessonNumber, cumVocab: running, newWords: l.vocabCount }
  })

  const hasScores = data.some((l) => l.score !== null)
  const hasTalk = data.some((l) => l.talkPct !== null)

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn btn-ghost"
        style={{ width: '100%', justifyContent: 'center', gap: 8, background: 'var(--brand-soft)', borderColor: 'transparent', color: 'var(--brand)', marginBottom: open ? 14 : 0 }}
      >
        <span>Progress charts</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '.2s' }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: hasScores && hasTalk ? 'repeat(2, minmax(0,1fr))' : '1fr', gap: 14 }}>
            {hasScores && (
              <div className="analytics-card" style={{ padding: 18 }}>
                <p className="analytics-label" style={{ marginBottom: 12 }}>📈 Score Progress</p>
                <ResponsiveContainer width="100%" height={160}>
                  <ComposedChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barSize={22}>
                    <defs>
                      <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={BRAND} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={BRAND} stopOpacity={0.12} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="lessonNumber" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(n) => `L${n}`} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={7} stroke="#e0e7ff" strokeDasharray="4 3" />
                    <Tooltip content={<CustomTooltip suffix="/10" label2="score" />} />
                    <Bar dataKey="score" fill="url(#sg)" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="score" stroke={BRAND} strokeWidth={2} dot={{ fill: BRAND, r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: BRAND, stroke: '#fff', strokeWidth: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {hasTalk && (
              <div className="analytics-card" style={{ padding: 18 }}>
                <p className="analytics-label" style={{ marginBottom: 12 }}>🗣️ Your Talk Time</p>
                <ResponsiveContainer width="100%" height={160}>
                  <ComposedChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barSize={22}>
                    <defs>
                      <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PURPLE} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={PURPLE} stopOpacity={0.12} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="lessonNumber" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(n) => `L${n}`} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} />
                    <ReferenceLine y={50} stroke="#ede9fe" strokeDasharray="4 3" />
                    <Tooltip content={<CustomTooltip suffix="%" label2="talk time" />} />
                    <Bar dataKey="talkPct" fill="url(#tg)" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="talkPct" stroke={PURPLE} strokeWidth={2} dot={{ fill: PURPLE, r: 3, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: PURPLE, stroke: '#fff', strokeWidth: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="analytics-card" style={{ padding: 18 }}>
            <p className="analytics-label" style={{ marginBottom: 12 }}>📖 Vocabulary Growth</p>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={vocabData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barSize={20}>
                <defs>
                  <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND} stopOpacity={1} />
                    <stop offset="100%" stopColor={PURPLE} stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="lessonNumber" tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(n) => `L${n}`} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 11, boxShadow: 'var(--shadow)', padding: '8px 11px', fontSize: 11 }}>
                        <p style={{ color: 'var(--muted)', margin: '0 0 3px', fontWeight: 700 }}>Lesson {label}</p>
                        <p style={{ color: 'var(--ink)', margin: 0, fontWeight: 800 }}>{payload[0].value} total words</p>
                        <p style={{ color: 'var(--muted)', margin: 0 }}>+{payload[0].payload.newWords} this lesson</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="cumVocab" fill="url(#vg)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
