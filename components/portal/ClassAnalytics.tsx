'use client'

/**
 * The whole roster in one picture.
 *
 * Every number here already exists on a student's own page; what it cannot
 * show is rank and spread — who is pulling away, who has gone quiet, who has
 * not been seen in a month. That question is only answerable side by side,
 * which is what this is for.
 *
 * Anything a student has not produced yet is drawn as absent rather than as
 * zero. A student with no scored lesson has not scored nought.
 */

import {
  Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

export type StudentAnalytics = {
  id: string
  name: string
  lessons: number
  avgScore: number | null
  firstScore: number | null
  lastScore: number | null
  avgTalk: number | null
  vocab: number
  avgWpm: number | null
  avgThink: number | null
  avgFillers: number | null
  avgTurnWords: number | null
  daysSinceLast: number | null
}

const AXIS = { fontSize: 10, fill: 'var(--muted)', fontWeight: 700 }
const BRAND = '#0a61c9'

/** The portal's card look, not Recharts' default box. */
function Tip({ active, payload, label, suffix = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 9, boxShadow: 'var(--shadow)', padding: '6px 10px', fontSize: 11, lineHeight: 1.45 }}>
      <div style={{ color: 'var(--muted)', fontWeight: 700 }}>{label}</div>
      <div style={{ color: 'var(--ink)', fontWeight: 800 }}>{payload[0].value}{suffix}</div>
    </div>
  )
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="analytics-card">
      <h3 style={{ margin: 0, fontSize: 14, letterSpacing: '-.01em' }}>{title}</h3>
      {sub && <p style={{ margin: '3px 0 12px', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>{sub}</p>}
      {children}
    </section>
  )
}

/** First lesson to last, per student — the only chart here about direction. */
function Progression({ rows }: { rows: StudentAnalytics[] }) {
  const moved = rows.filter((r) => r.firstScore != null && r.lastScore != null && r.lessons > 1)
  if (moved.length === 0) {
    return (
      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
        Nobody has a second scored lesson yet — this fills in as they build a history.
      </p>
    )
  }
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {moved.map((r) => {
        const delta = (r.lastScore as number) - (r.firstScore as number)
        // A tenth of a point is noise, not progress.
        const up = delta > 0.2
        const down = delta < -0.2
        const colour = up ? 'var(--green)' : down ? 'var(--red)' : 'var(--muted)'
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
            <span style={{ flex: '1 1 90px', fontWeight: 700, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.name}
            </span>
            <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
              {r.firstScore?.toFixed(1)} → <b style={{ color: 'var(--ink)' }}>{r.lastScore?.toFixed(1)}</b>
            </span>
            <span style={{ color: colour, fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: 52, textAlign: 'right' }}>
              {up ? '▲' : down ? '▼' : '▬'} {Math.abs(delta).toFixed(1)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * One measure, every student, ranked, with the class average across it.
 *
 * Vertical bars: names sit under their own column and the eye reads the
 * skyline in one pass, which is the whole point of putting a roster on one
 * chart. The average line is what turns a ranking into a judgement — third
 * of five means nothing until you can see whether third is above or below
 * the middle of your own class.
 *
 * `lowerIsBetter` only flips the sort. The bar is not recoloured for it,
 * because "good" depends on the student: a long pause before answering is
 * where a beginner lives, not a fault.
 */
function Compare({
  rows, pick, title, sub, unit, colour, domain, decimals = 0, lowerIsBetter = false, marker,
}: {
  rows: StudentAnalytics[]
  pick: (r: StudentAnalytics) => number | null
  title: string
  sub: string
  unit: string
  colour: string
  domain?: [number, number]
  decimals?: number
  lowerIsBetter?: boolean
  marker?: number
}) {
  const data = rows
    .filter((r) => pick(r) != null)
    .sort((a, b) => (lowerIsBetter ? (pick(a) as number) - (pick(b) as number) : (pick(b) as number) - (pick(a) as number)))
    .map((r) => ({ name: r.name, value: Number((pick(r) as number).toFixed(decimals)) }))

  // The average of the students who have this measure, not of the roster —
  // nobody is dragged down by a student who has not been recorded yet.
  const avg = data.length
    ? Number((data.reduce((n, d) => n + d.value, 0) / data.length).toFixed(decimals))
    : null

  return (
    <Card title={title} sub={sub}>
      {data.length ? (
        <>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data} margin={{ left: 0, right: 8, top: 18, bottom: 4 }}>
              <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} interval={0} />
              <YAxis domain={domain ?? [0, 'auto']} width={38} tick={AXIS} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip suffix={unit} />} cursor={{ fill: 'rgba(10,97,201,.06)' }} />
              {marker != null && <ReferenceLine y={marker} stroke="var(--muted)" strokeDasharray="2 4" />}
              {avg != null && (
                <ReferenceLine
                  y={avg}
                  stroke="var(--ink)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.55}
                  label={{ value: `class avg ${avg}`, position: 'insideTopRight', fontSize: 10, fontWeight: 700, fill: 'var(--muted)' }}
                />
              )}
              <Bar dataKey="value" isAnimationActive={false} radius={[6, 6, 0, 0]} maxBarSize={64}>
                {data.map((d) => (
                  // Above or below the line, at a glance, without a legend.
                  <Cell key={d.name} fill={colour} fillOpacity={avg != null && d.value < avg ? 0.45 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>Not measured yet — this fills in as lessons are recorded.</p>
      )}
    </Card>
  )
}

export default function ClassAnalytics({ rows }: { rows: StudentAnalytics[] }) {
  const scored = rows.filter((r) => r.avgScore != null)
  const talking = rows.filter((r) => r.avgTalk != null)

  const totalLessons = rows.reduce((n, r) => n + r.lessons, 0)
  const classAvg = scored.length
    ? scored.reduce((n, r) => n + (r.avgScore as number), 0) / scored.length
    : null
  const classTalk = talking.length
    ? talking.reduce((n, r) => n + (r.avgTalk as number), 0) / talking.length
    : null
  const totalVocab = rows.reduce((n, r) => n + r.vocab, 0)

  // Three weeks without a lesson is the point at which a teacher would want to
  // be told, rather than notice for themselves at the end of a term.
  const quiet = rows.filter((r) => r.daysSinceLast != null && (r.daysSinceLast as number) >= 21)

  const scoreData = [...scored].sort((a, b) => (b.avgScore as number) - (a.avgScore as number))
    .map((r) => ({ name: r.name, value: Number((r.avgScore as number).toFixed(1)) }))
  const talkData = [...talking].sort((a, b) => (b.avgTalk as number) - (a.avgTalk as number))
    .map((r) => ({ name: r.name, value: Math.round(r.avgTalk as number) }))
  const vocabData = [...rows].filter((r) => r.vocab > 0).sort((a, b) => b.vocab - a.vocab)
    .map((r) => ({ name: r.name, value: r.vocab }))
  const lessonData = [...rows].sort((a, b) => b.lessons - a.lessons)
    .map((r) => ({ name: r.name, value: r.lessons }))

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
          {stat('Lessons taught', String(totalLessons), `across ${rows.length} students`)}
          {stat('Class average', classAvg != null ? classAvg.toFixed(1) : '—', scored.length ? `from ${scored.length} scored students` : 'no scored lessons yet')}
          {stat('Average talk share', classTalk != null ? `${Math.round(classTalk)}%` : '—', 'of lesson time is the student')}
          {stat('Vocabulary met', String(totalVocab), 'words across all lessons')}
        </div>
      </section>

      {quiet.length > 0 && (
        <div className="warn-box" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <strong>Not seen in a while:</strong>
          {quiet.map((r) => (
            <span key={r.id} className="pill" style={{ background: '#fff', border: '1px solid #ead7a5', color: 'var(--amber)' }}>
              {r.name} · {r.daysSinceLast}d
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        <Compare
          rows={rows}
          pick={(r) => r.avgScore}
          title="Average score"
          sub="Out of 10, across every scored lesson."
          unit=" / 10"
          colour={BRAND}
          domain={[0, 10]}
          decimals={1}
        />

        <Card title="Score progression" sub="First scored lesson to the most recent one.">
          <Progression rows={rows} />
        </Card>
        <Compare
          rows={rows}
          pick={(r) => r.avgTalk}
          title="Talk share"
          sub="How much of the lesson was the student speaking. The dashed line is 50% — under it, you are doing more of the talking."
          unit="% of the lesson"
          colour="#e0a63b"
          domain={[0, 100]}
          marker={50}
        />

        <Compare
          rows={rows}
          pick={(r) => r.avgWpm}
          title="Speaking pace"
          sub="Words a minute while the student was the one talking. Rising over time is fluency; the number itself says more about the language than the learner."
          unit=" words / min"
          colour={BRAND}
        />

        <Compare
          rows={rows}
          pick={(r) => r.avgThink}
          title="Thinking time"
          sub="Seconds between you finishing and the student starting. Shortest first — a long pause is where the work is happening, not a fault."
          unit="s before replying"
          colour="#7c5cd6"
          decimals={1}
          lowerIsBetter
        />

        <Compare
          rows={rows}
          pick={(r) => r.avgTurnWords}
          title="Words per turn"
          sub="How much they say each time they speak. Short turns with a quick pace usually means answering, not conversing."
          unit=" words a turn"
          colour="#2f8f5b"
        />

        <Compare
          rows={rows}
          pick={(r) => r.avgFillers}
          title="Filler words"
          sub="Ums and ahs per lesson, fewest first. Worth reading next to pace: fast and full of fillers is a different problem from slow and clean."
          unit=" per lesson"
          colour="#c98a8a"
          lowerIsBetter
        />

        <Compare
          rows={rows}
          pick={(r) => (r.vocab > 0 ? r.vocab : null)}
          title="Vocabulary met"
          sub="Distinct words counted across every lesson."
          unit=" words"
          colour="#3f8fa8"
        />

      </div>
    </div>
  )
}
