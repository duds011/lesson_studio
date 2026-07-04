import Link from 'next/link'
import { formatDateShort, ordinal } from '@/lib/portal-utils'
import { JLPT_COLORS } from '@/components/portal/VocabLevelBreakdown'

/**
 * Full lesson recap view — shared by the student portal and the teacher's
 * per-student drill-down so both see identical rich detail.
 */
export default function LessonRecapView({
  lesson,
  backHref,
  backLabel = 'Back',
  showStatus = false,
}: {
  lesson: any
  backHref: string
  backLabel?: string
  showStatus?: boolean
}) {
  const summary = Array.isArray(lesson.lesson_summaries) ? lesson.lesson_summaries[0] : lesson.lesson_summaries
  const sections = (lesson.lesson_sections || []).slice().sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const vocab = (lesson.vocabulary_items || []).slice().sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const homework = (lesson.homework_items || []).slice().sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  return (
    <div className="page-fade">
      <Link href={backHref} className="btn btn-ghost btn-sm" style={{ marginBottom: 18 }}>← {backLabel}</Link>

      <div className="lesson-hero">
        <div>
          <span className="eyebrow">{ordinal(lesson.lesson_number)} lesson · {formatDateShort(lesson.lesson_date)}</span>
          <h1>{lesson.title || `Lesson ${lesson.lesson_number}`}</h1>
          <div className="lesson-meta">
            {showStatus && (
              <div className="meta-box">
                <span className="meta-label">Status</span>
                <div className="meta-value">
                  <span className={`status-pill ${lesson.status === 'published' ? 'published' : 'draft'}`}>{lesson.status}</span>
                </div>
              </div>
            )}
            {summary?.talk_percentage != null && (
              <div className="meta-box">
                <span className="meta-label">Student spoke</span>
                <div className="meta-value">{summary.talk_percentage}%</div>
              </div>
            )}
          </div>
        </div>
        {summary?.score != null && (
          <div className="lesson-score">
            <strong>{summary.score}</strong>
            <span>SCORE / 10</span>
          </div>
        )}
      </div>

      {summary?.teacher_note && <div className="callout" style={{ margin: '20px 0' }}>{summary.teacher_note}</div>}

      {summary?.recap && (
        <div className="lesson-block" style={{ marginTop: 20, whiteSpace: 'pre-wrap' }}>
          <h3>Lesson recap</h3>
          <div style={{ color: 'var(--ink)', lineHeight: 1.7 }}>{summary.recap}</div>
        </div>
      )}

      {sections.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h2 className="section-heading">Grammar & topics</h2>
          {sections.map((s: any, i: number) => (
            <div key={i} className="lesson-block">
              <h3>{s.title}</h3>
              <div style={{ whiteSpace: 'pre-wrap', color: 'var(--ink)', lineHeight: 1.7 }}>{s.content}</div>
            </div>
          ))}
        </section>
      )}

      {vocab.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h2 className="section-heading">Vocabulary</h2>
          <div className="lesson-block">
            {vocab.map((v: any, i: number) => (
              <div key={i} className="example">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className="jp" style={{ fontSize: 16 }}>{v.word}</span>
                  {v.reading && <span className="romaji">{v.reading}</span>}
                  {v.jlpt_level && (
                    <span className="jlpt" style={{ background: (JLPT_COLORS[v.jlpt_level] ?? '#6259e8') + '18', color: JLPT_COLORS[v.jlpt_level] ?? '#6259e8' }}>{v.jlpt_level}</span>
                  )}
                </div>
                {v.definition && <div style={{ marginTop: 4 }}>{v.definition}</div>}
                {v.explanation && <div style={{ marginTop: 2, color: 'var(--muted)', fontSize: 13 }}>{v.explanation}</div>}
                {v.example_sentence && <div className="jp" style={{ marginTop: 6, fontWeight: 500 }}>{v.example_sentence}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {homework.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h2 className="section-heading">Homework</h2>
          <div className="lesson-block">
            <ul className="fc-list">
              {homework.map((h: any, i: number) => (
                <li key={i}>{h.description}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
