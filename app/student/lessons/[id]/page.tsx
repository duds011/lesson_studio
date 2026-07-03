import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDateShort, ordinal } from '@/lib/portal-utils'
import { JLPT_COLORS } from '@/components/portal/VocabLevelBreakdown'

export const dynamic = 'force-dynamic'

export default async function StudentLessonPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      id, lesson_number, lesson_date, title, status,
      lesson_summaries ( recap, score, talk_percentage, teacher_note ),
      lesson_sections ( title, content, sort_order ),
      vocabulary_items ( word, reading, definition, explanation, example_sentence, jlpt_level, sort_order ),
      homework_items ( description, sort_order )
    `)
    .eq('id', params.id)
    .single()

  if (!lesson) notFound()

  const l = lesson as any
  const summary = Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries
  const sections = (l.lesson_sections || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const vocab = (l.vocabulary_items || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const homework = (l.homework_items || []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  return (
    <div className="page-fade">
      <Link href="/student/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 18 }}>← Dashboard</Link>

      <div className="lesson-hero">
        <div>
          <span className="eyebrow">{ordinal(l.lesson_number)} lesson · {formatDateShort(l.lesson_date)}</span>
          <h1>{l.title || `Lesson ${l.lesson_number}`}</h1>
          <div className="lesson-meta">
            {summary?.talk_percentage != null && (
              <div className="meta-box">
                <span className="meta-label">You spoke</span>
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

      {summary?.teacher_note && (
        <div className="callout" style={{ margin: '20px 0' }}>{summary.teacher_note}</div>
      )}

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
