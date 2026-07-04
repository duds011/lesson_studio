import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDateShort, ordinal } from '@/lib/portal-utils'
import ProgressCharts from '@/components/portal/ProgressCharts'
import VocabLevelBreakdown from '@/components/portal/VocabLevelBreakdown'

export const dynamic = 'force-dynamic'

export default async function TeacherStudentPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!student) notFound()

  // Teacher RLS returns all their students' lessons, including drafts.
  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id, lesson_number, lesson_date, title, status,
      lesson_summaries ( score, talk_percentage, recap, vocab_level_distribution, vocab_total_count ),
      vocabulary_items ( id )
    `)
    .eq('student_id', student.id)
    .order('lesson_number', { ascending: false })

  const rows = (lessons || []) as any[]
  const summaryOf = (l: any) => (Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries)

  const lessonCount = rows.length
  const scores = rows.map((l) => summaryOf(l)?.score).filter((s) => s != null) as number[]
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  const latestTalk = rows.map((l) => summaryOf(l)?.talk_percentage).filter((t) => t != null)[0] ?? null

  const vocabDistribution: Record<string, number> = {}
  for (const l of rows) {
    const dist = summaryOf(l)?.vocab_level_distribution
    if (dist && typeof dist === 'object') {
      for (const [level, count] of Object.entries(dist)) {
        vocabDistribution[level] = (vocabDistribution[level] ?? 0) + (count as number)
      }
    }
  }
  const totalVocab = Object.values(vocabDistribution).reduce((sum, n) => sum + n, 0)

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <Link href="/teacher/dashboard" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}>← All students</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="avatar lg">{student.full_name.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}</div>
          <div>
            <h1 className="title" style={{ margin: 0 }}>{student.full_name}</h1>
            <p className="sub" style={{ margin: 0 }}>{student.email} · {student.level} · {student.language}</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card"><span className="analytics-label">Lessons</span><div className="analytics-value" style={{ color: 'var(--brand)' }}>{lessonCount}</div></div>
        <div className="analytics-card"><span className="analytics-label">Avg Score</span><div className="analytics-value" style={{ color: 'var(--brand)' }}>{avgScore != null ? avgScore.toFixed(1) : '—'}<span style={{ fontSize: 15, fontWeight: 400, color: 'var(--muted)' }}>/10</span></div></div>
        <div className="analytics-card"><span className="analytics-label">Latest Talk</span><div className="analytics-value" style={{ color: 'var(--brand)' }}>{latestTalk ?? '—'}<span style={{ fontSize: 15, fontWeight: 400, color: 'var(--muted)' }}>%</span></div></div>
        <div className="analytics-card"><span className="analytics-label">Vocab items</span><div className="analytics-value" style={{ color: 'var(--brand)' }}>{totalVocab}</div></div>
      </div>

      {totalVocab > 0 && <VocabLevelBreakdown distribution={vocabDistribution} totalCount={totalVocab} />}

      {lessonCount >= 2 && (
        <ProgressCharts
          lessons={rows.map((l) => {
            const s = summaryOf(l)
            const dist = s?.vocab_level_distribution
            const distSum = dist && typeof dist === 'object' ? Object.values(dist).reduce((a: number, b: any) => a + Number(b), 0) : 0
            const vocabCount = s?.vocab_total_count ?? (distSum > 0 ? distSum : (l.vocabulary_items?.length ?? 0))
            return { lessonNumber: l.lesson_number, score: s?.score ?? null, talkPct: s?.talk_percentage ?? null, vocabCount }
          })}
        />
      )}

      <section>
        <h2 className="section-heading">Lessons & recaps</h2>
        {rows.length === 0 ? (
          <div className="empty"><strong style={{ color: 'var(--ink)' }}>No lessons yet</strong><br />Recorded lessons for this student will appear here.</div>
        ) : (
          <div>
            {rows.map((lesson) => {
              const s = summaryOf(lesson)
              return (
                <Link key={lesson.id} href={`/teacher/students/${student.id}/lessons/${lesson.id}`} className="lesson-card">
                  <div className="lc-num">L{lesson.lesson_number}</div>
                  <div>
                    <div className="lc-title">{lesson.title || `Lesson ${lesson.lesson_number}`}</div>
                    <div className="lc-meta">{ordinal(lesson.lesson_number)} lesson · {formatDateShort(lesson.lesson_date)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`status-pill ${lesson.status === 'published' ? 'published' : 'draft'}`}>{lesson.status}</span>
                    {s?.score != null && <span className="lc-score" style={{ color: 'var(--brand)' }}>{s.score}<span style={{ fontSize: 10, color: 'var(--muted)' }}>/10</span></span>}
                  </div>
                  <span className="lc-arrow">→</span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
