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
    <div className="vocab-line analytics-card">
      <span className="vocab-line-label">
        Vocabulary <strong>{totalCount}</strong>
      </span>
      <div className="vocab-line-bar" role="img" aria-label={`Vocabulary by JLPT level: ${levels.map((l) => `${l.level} ${l.count}`).join(', ')}`}>
        {levels.map((l) => (
          <div key={l.level} style={{ width: `${l.pct}%`, background: JLPT_COLORS[l.level] }} title={`${l.level}: ${l.count}`} />
        ))}
      </div>
      <div className="vocab-line-chips">
        {levels.map((l) => (
          <span key={l.level} className="vocab-chip" style={{ color: JLPT_COLORS[l.level] }}>
            <i style={{ background: JLPT_COLORS[l.level] }} />{l.level} {l.count}
          </span>
        ))}
      </div>
    </div>
  )
}
