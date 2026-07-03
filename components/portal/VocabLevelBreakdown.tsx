const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

export const JLPT_COLORS: Record<string, string> = {
  N5: '#22c55e',
  N4: '#3b82f6',
  N3: '#6259e8',
  N2: '#a855f7',
  N1: '#ec4899',
}

export default function VocabLevelBreakdown({
  distribution,
  totalCount,
}: {
  distribution: Record<string, number>
  totalCount: number
}) {
  if (!totalCount) return null

  const levels = JLPT_LEVELS.map((level) => ({
    level,
    count: distribution[level] ?? 0,
    pct: totalCount ? ((distribution[level] ?? 0) / totalCount) * 100 : 0,
  })).filter((l) => l.count > 0)

  return (
    <div className="analytics-card" style={{ padding: 18 }}>
      <p className="analytics-label" style={{ marginBottom: 12 }}>🧩 Vocabulary by JLPT level</p>

      <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: 'var(--surface-2)' }}>
        {levels.map((l) => (
          <div key={l.level} style={{ width: `${l.pct}%`, background: JLPT_COLORS[l.level] }} title={`${l.level}: ${l.count}`} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {levels.map((l) => (
          <span
            key={l.level}
            className="jlpt"
            style={{ background: JLPT_COLORS[l.level] + '18', color: JLPT_COLORS[l.level], border: `1px solid ${JLPT_COLORS[l.level]}35` }}
          >
            {l.level} · {l.count}
          </span>
        ))}
      </div>
    </div>
  )
}
