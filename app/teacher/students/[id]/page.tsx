import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDateShort, lessonDisplayTitle, ordinal } from '@/lib/portal-utils'
import { getStudentCredits } from '@/lib/credits'
import ProgressCharts from '@/components/portal/ProgressCharts'
import VocabLevelBreakdown from '@/components/portal/VocabLevelBreakdown'
import StudentAdminActions from '@/components/portal/StudentAdminActions'
import GenerateTestButton from '@/components/portal/GenerateTestButton'
import PageHeader from '@/components/PageHeader'

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
      lesson_summaries ( score, talk_percentage, recap, recap_json, vocab_level_distribution, vocab_total_count ),
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
  const credits = await getStudentCredits(supabase, student.id)

  const { data: tests } = await supabase
    .from('tests')
    .select('id, title, level, status, created_at, lessons ( lesson_number )')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })

  // Lessons a test can be generated from (needs a recap to work with).
  const testableLessons = rows
    .filter((l) => summaryOf(l)?.recap_json)
    .map((l) => ({ id: l.id, label: `Lesson ${l.lesson_number} — ${lessonDisplayTitle(summaryOf(l)?.recap_json, l.title, l.lesson_number)}` }))

  return (
    <div className="k-page" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/teacher/dashboard" className="btn btn-ghost btn-sm">← All students</Link>
        <StudentAdminActions studentId={student.id} hasLogin={!!student.profile_id} />
      </div>

      <PageHeader
        lead={<div className="avatar lg">{student.full_name.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}</div>}
        title={student.full_name}
        meta={`${student.email} · ${student.level} · ${student.language}`}
        figures={[
          { label: 'Lessons', value: lessonCount },
          { label: 'Avg score', value: <>{avgScore != null ? avgScore.toFixed(1) : '—'}<i>/10</i></> },
          { label: 'Latest talk', value: <>{latestTalk ?? '—'}<i>%</i></> },
          { label: 'Vocab items', value: totalVocab },
        ]}
        actions={
          <>
            {/* Credits keep their own red/amber/blue inside the band — this is
                the one figure that changes what a teacher does next. */}
            <span className="pill" style={{ background: credits.remaining <= 0 ? 'var(--red-soft)' : credits.low ? 'var(--amber-soft)' : '#fff', color: credits.remaining <= 0 ? 'var(--red)' : credits.low ? 'var(--amber)' : 'var(--brand)' }}>
              {credits.purchased > 0 || credits.used > 0 ? `${credits.remaining} lesson${credits.remaining === 1 ? '' : 's'} left / ${credits.purchased} bought` : 'No lessons purchased yet'}{credits.low && (credits.purchased > 0 || credits.used > 0) ? ' ⚠️' : ''}
            </span>
            <Link href="/teacher/payments" className="btn btn-ghost btn-sm">Manage payments →</Link>
          </>
        }
      />


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
                    <div className="lc-title">{lessonDisplayTitle(s?.recap_json, lesson.title, lesson.lesson_number)}</div>
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

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '0 0 11px' }}>
          <h2 className="section-heading" style={{ margin: 0 }}>Practice tests</h2>
          <GenerateTestButton studentId={student.id} lessons={testableLessons} />
        </div>
        {(tests ?? []).length === 0 ? (
          <div className="empty" style={{ padding: 26 }}>
            <strong style={{ color: 'var(--ink)' }}>No tests yet</strong>
            <br />
            Generate an N5-style practice test from any lesson recap. You review it before the student sees it.
          </div>
        ) : (
          <div>
            {(tests as any[]).map((t) => {
              const lesson = Array.isArray(t.lessons) ? t.lessons[0] : t.lessons
              return (
                <Link key={t.id} href={`/teacher/students/${student.id}/tests/${t.id}`} className="lesson-card">
                  <div className="lc-num" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>{t.level}</div>
                  <div>
                    <div className="lc-title">{t.title}</div>
                    <div className="lc-meta">{lesson ? `From lesson ${lesson.lesson_number} · ` : ''}{formatDateShort(t.created_at)}</div>
                  </div>
                  <span className={`status-pill ${t.status === 'published' ? 'published' : 'draft'}`}>{t.status}</span>
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
