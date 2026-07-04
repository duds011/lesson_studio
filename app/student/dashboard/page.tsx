import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStudentCredits } from '@/lib/credits'
import { formatDateShort, getLevelLabel, ordinal } from '@/lib/portal-utils'
import ProgressCharts from '@/components/portal/ProgressCharts'
import VocabLevelBreakdown from '@/components/portal/VocabLevelBreakdown'

export const dynamic = 'force-dynamic'

const MILESTONES = [1, 5, 10, 25, 50]
const MILESTONE_EMOJIS = ['🌱', '🌸', '🌿', '⭐', '🏆']

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  if (!student) {
    return (
      <div className="empty" style={{ marginTop: 40 }}>
        <p style={{ fontSize: 34, margin: 0 }}>⏳</p>
        <strong style={{ color: 'var(--ink)' }}>Account not linked yet</strong>
        <br />
        Ask your teacher to link your account.
      </div>
    )
  }

  const { data: lessons } = await supabase
    .from('lessons')
    .select(`
      id, lesson_number, lesson_date, title,
      lesson_summaries ( score, talk_percentage, recap, vocab_level_distribution, vocab_total_count ),
      vocabulary_items ( id, jlpt_level )
    `)
    .eq('student_id', student.id)
    .eq('status', 'published')
    .order('lesson_number', { ascending: false })

  const rows = (lessons || []) as any[]
  const summaryOf = (l: any) => (Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries)

  const lessonCount = rows.reduce((max, l) => Math.max(max, l.lesson_number ?? 0), 0)
  const scores = rows.map((l) => summaryOf(l)?.score).filter((s) => s != null) as number[]
  const latestScore = scores[0] ?? null
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  const firstScore = scores[scores.length - 1]
  const scoreDelta = latestScore != null && firstScore != null
    ? (latestScore - firstScore >= 0 ? '+' : '') + (latestScore - firstScore).toFixed(1)
    : '+0.0'

  const talks = rows.map((l) => summaryOf(l)?.talk_percentage).filter((t) => t != null) as number[]
  const latestTalk = talks[0] ?? null
  const firstTalk = talks[talks.length - 1] ?? null
  const talkDelta = latestTalk != null && firstTalk != null ? latestTalk - firstTalk : null

  // Aggregate the full GPT-detected vocab distribution across lessons.
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

  const nextMilestone = MILESTONES.find((m) => m > lessonCount) ?? 50
  const levelLabel = getLevelLabel(lessonCount)

  // Payments are teacher-only under RLS, so read the credit totals with admin
  // and surface only the resulting count to the student.
  const credits = await getStudentCredits(createAdminClient(), student.id)

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      {/* Header */}
      <div>
        <span className="eyebrow">Student View</span>
        <h1 className="title" style={{ margin: '6px 0 4px' }}>Welcome back, {student.full_name.split(' ')[0]}</h1>
        <p className="sub">Your lessons, progress, and recaps — all in one place.</p>
      </div>

      {/* Lessons remaining + book */}
      <div className="analytics-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderColor: credits.remaining <= 0 ? '#f0cece' : credits.low ? '#ead7a5' : 'var(--line)', background: credits.remaining <= 0 ? 'var(--red-soft)' : credits.low ? 'var(--amber-soft)' : 'var(--surface)' }}>
        <div>
          <span className="analytics-label">Lessons remaining</span>
          <div className="analytics-value" style={{ color: credits.remaining <= 0 ? 'var(--red)' : credits.low ? 'var(--amber)' : 'var(--brand)' }}>
            {credits.remaining}
            {credits.purchased > 0 && <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}> / {credits.purchased} bought</span>}
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {credits.remaining <= 0 ? 'You’re out of prepaid lessons — time to top up.' : credits.low ? 'You’re on your last lesson — consider booking a new package.' : 'Book your next lesson any time.'}
          </span>
        </div>
        <Link href="/student/book" className="btn btn-primary">Book a lesson →</Link>
      </div>

      {/* Progress stats */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <span className="analytics-label">Lessons</span>
          <div className="analytics-value" style={{ color: 'var(--brand)' }}>{lessonCount}</div>
        </div>
        <div className="analytics-card">
          <span className="analytics-label">Latest Score</span>
          <div className="analytics-value" style={{ color: 'var(--brand)' }}>
            {latestScore ?? '—'}<span style={{ fontSize: 15, fontWeight: 400, color: 'var(--muted)' }}>/10</span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>{scoreDelta} since lesson 1</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-label">Avg Score</span>
          <div className="analytics-value" style={{ color: 'var(--brand)' }}>
            {avgScore != null ? avgScore.toFixed(1) : '—'}<span style={{ fontSize: 15, fontWeight: 400, color: 'var(--muted)' }}>/10</span>
          </div>
        </div>
        <div className="analytics-card">
          <span className="analytics-label">You Talk</span>
          <div className="analytics-value" style={{ color: 'var(--brand)' }}>
            {latestTalk ?? '—'}<span style={{ fontSize: 15, fontWeight: 400, color: 'var(--muted)' }}>%</span>
          </div>
          {talkDelta !== null && (
            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{talkDelta >= 0 ? '+' : ''}{talkDelta}% since lesson 1</span>
          )}
        </div>
      </div>

      {/* Milestone track */}
      <div className="analytics-card" style={{ padding: 20 }}>
        <div style={{ position: 'relative', padding: '2.5rem 12px 1.75rem' }}>
          <div style={{ position: 'relative', height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
            <div style={{ position: 'absolute', height: '100%', borderRadius: 999, transition: '.7s', width: `${Math.min((lessonCount / 50) * 100, 100)}%`, background: 'linear-gradient(90deg, var(--brand), #8b5cf6)' }} />
            {MILESTONES.map((m, i) => {
              const pct = (m / 50) * 100
              const reached = lessonCount >= m
              return (
                <div key={m} style={{ position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)', left: `${pct}%` }}>
                  <span style={{ position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)', fontSize: 16, lineHeight: 1 }}>{MILESTONE_EMOJIS[i]}</span>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid', borderColor: reached ? 'var(--brand)' : 'var(--line-strong)', background: reached ? 'var(--brand)' : '#fff' }} />
                  <span style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>{m}</span>
                </div>
              )
            })}
          </div>
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
          {nextMilestone > lessonCount
            ? `${nextMilestone - lessonCount} more lesson${nextMilestone - lessonCount !== 1 ? 's' : ''} to unlock ${MILESTONE_EMOJIS[MILESTONES.indexOf(nextMilestone)]} ${levelLabel}`
            : '🏆 Maximum milestone reached!'}
        </p>
      </div>

      {/* Vocabulary breakdown */}
      {totalVocab > 0 && <VocabLevelBreakdown distribution={vocabDistribution} totalCount={totalVocab} />}

      {/* Charts (need ≥2 lessons) */}
      {lessonCount >= 2 && (
        <ProgressCharts
          lessons={rows.map((l) => {
            const s = summaryOf(l)
            const dist = s?.vocab_level_distribution
            const distSum = dist && typeof dist === 'object' ? Object.values(dist).reduce((a: number, b: any) => a + Number(b), 0) : 0
            const vocabCount = s?.vocab_total_count ?? (distSum > 0 ? distSum : (l.vocabulary_items?.length ?? 0))
            return {
              lessonNumber: l.lesson_number,
              score: s?.score ?? null,
              talkPct: s?.talk_percentage ?? null,
              vocabCount,
            }
          })}
        />
      )}

      {/* Lessons */}
      <section>
        <h2 className="section-heading">Your lessons</h2>
        {rows.length === 0 ? (
          <div className="empty">
            <strong style={{ color: 'var(--ink)' }}>No lessons yet</strong>
            <br />
            Your lessons will appear here once your teacher publishes them.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {rows.map((lesson, idx) => {
              const s = summaryOf(lesson)
              const preview = s?.recap ? String(s.recap).replace(/[#*_>`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120) + '…' : ''
              return (
                <Link key={lesson.id} href={`/student/lessons/${lesson.id}`} className="surface" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span className="pill" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                      Lesson {lesson.lesson_number}{idx === 0 ? ' · Latest' : ''}
                    </span>
                    {s?.score != null && <span style={{ fontWeight: 800, color: 'var(--brand)', fontSize: 12 }}>{s.score}/10</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 750, fontSize: 15, lineHeight: 1.3 }}>{lesson.title || `Lesson ${lesson.lesson_number}`}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{ordinal(lesson.lesson_number)} lesson · {formatDateShort(lesson.lesson_date)}</div>
                  </div>
                  {preview && <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{preview}</p>}
                  <span className="btn btn-primary" style={{ marginTop: 'auto', justifyContent: 'center', width: '100%' }}>Open Lesson →</span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
