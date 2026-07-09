import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStudentCredits } from '@/lib/credits'
import { getTeacherPaymentMethods } from '@/lib/payment-methods'
import { formatDateShort, getLevelLabel, lessonDisplayTitle, ordinal } from '@/lib/portal-utils'
import ProgressCharts from '@/components/portal/ProgressCharts'
import VocabLevelBreakdown from '@/components/portal/VocabLevelBreakdown'
import PaymentMethodsPanel from '@/components/portal/PaymentMethodsPanel'
import StudentLessonsBar, { BuyPkg } from '@/components/portal/StudentLessonsBar'

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
      lesson_summaries ( score, talk_percentage, recap, recap_json, vocab_level_distribution, vocab_total_count ),
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

  // Speaking metrics averaged across all lessons (from recap_json.metrics).
  const metricAvg = (key: string) => {
    const vals = rows.map((l) => summaryOf(l)?.recap_json?.metrics?.[key]).filter((v) => typeof v === 'number') as number[]
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  const avgThinkSec = metricAvg('avgResponseSec')
  const avgWpm = metricAvg('studentWpm')
  const avgTurnWords = metricAvg('avgTurnWords')

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
  const admin = createAdminClient()
  const [credits, paymentMethods, { data: pkgRows }] = await Promise.all([
    getStudentCredits(admin, student.id),
    getTeacherPaymentMethods(admin, student.teacher_id),
    admin.from('lesson_packages').select('id, name, lessons_count, amount, currency').eq('teacher_id', student.teacher_id).eq('active', true).order('amount', { ascending: true }),
  ])
  const buyPackages: BuyPkg[] = (pkgRows ?? []).map((p: any) => ({ id: p.id, name: p.name, lessons_count: p.lessons_count, amount: Number(p.amount), currency: p.currency }))

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      {/* Header */}
      <div>
        <span className="eyebrow">Student View</span>
        <h1 className="title" style={{ margin: '6px 0 4px' }}>Welcome back, {student.full_name.split(' ')[0]}</h1>
        <p className="sub">Your lessons, progress, and recaps — all in one place.</p>
      </div>

      {/* Compact lessons-remaining + book + buy-more (modal) */}
      <StudentLessonsBar credits={credits} packages={buyPackages} />

      {/* How to pay the teacher (manual methods) */}
      <PaymentMethodsPanel methods={paymentMethods} />

      {/* Snapshot: stat strip + slim milestone footer */}
      <div className="analytics-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="stat-strip">
          <div className="stat-cell">
            <span className="k">Lessons</span>
            <div className="v" style={{ color: 'var(--brand)' }}>{lessonCount}</div>
          </div>
          <div className="stat-cell">
            <span className="k">Latest Score</span>
            <div className="v">{latestScore ?? '—'}<span className="u">/10</span></div>
            <span className={`d ${scoreDelta.startsWith('+') && scoreDelta !== '+0.0' ? 'up' : ''}`}>{scoreDelta} since L1</span>
          </div>
          <div className="stat-cell">
            <span className="k">Avg Score</span>
            <div className="v">{avgScore != null ? avgScore.toFixed(1) : '—'}<span className="u">/10</span></div>
          </div>
          <div className="stat-cell">
            <span className="k">You Talk</span>
            <div className="v">{latestTalk ?? '—'}<span className="u">%</span></div>
            {talkDelta !== null && <span className={`d ${talkDelta > 0 ? 'up' : ''}`}>{talkDelta >= 0 ? '+' : ''}{talkDelta}% since L1</span>}
          </div>
          <div className="stat-cell">
            <span className="k">Thinking</span>
            <div className="v">{avgThinkSec != null ? avgThinkSec.toFixed(1) : '—'}<span className="u">s</span></div>
            <span className="d">avg before reply</span>
          </div>
          <div className="stat-cell">
            <span className="k">Pace</span>
            <div className="v">{avgWpm != null ? Math.round(avgWpm) : '—'}<span className="u">wpm</span></div>
            <span className="d">avg words / min</span>
          </div>
          <div className="stat-cell">
            <span className="k">Answers</span>
            <div className="v">{avgTurnWords != null ? Math.round(avgTurnWords) : '—'}<span className="u">words</span></div>
            <span className="d">avg per answer</span>
          </div>
        </div>

        <div className="milestone-slim">
          <span className="milestone-now" title={levelLabel}>
            {MILESTONE_EMOJIS[Math.max(0, MILESTONES.filter((m) => lessonCount >= m).length - 1)]}
          </span>
          <div className="milestone-track">
            <div className="milestone-fill" style={{ width: `${Math.min((lessonCount / 50) * 100, 100)}%` }} />
            {MILESTONES.map((m, i) => (
              <span
                key={m}
                className={`milestone-dot ${lessonCount >= m ? 'hit' : ''}`}
                style={{ left: `${(m / 50) * 100}%` }}
                title={`${MILESTONE_EMOJIS[i]} ${m} lessons`}
              />
            ))}
          </div>
          <span className="milestone-next">
            {nextMilestone > lessonCount
              ? `${nextMilestone - lessonCount} more to ${MILESTONE_EMOJIS[MILESTONES.indexOf(nextMilestone)]} ${getLevelLabel(nextMilestone)}`
              : '🏆 Max milestone reached'}
          </span>
        </div>
      </div>

      {/* Vocabulary breakdown */}
      {totalVocab > 0 && <VocabLevelBreakdown distribution={vocabDistribution} totalCount={totalVocab} />}

      {/* Progress sparklines (need ≥2 lessons) */}
      {lessonCount >= 2 && (
        <section>
          <h2 className="section-heading" style={{ margin: '4px 0 11px' }}>Your progress</h2>
          <ProgressCharts
            lessons={rows.map((l) => {
              const s = summaryOf(l)
              const dist = s?.vocab_level_distribution
              const distSum = dist && typeof dist === 'object' ? Object.values(dist).reduce((a: number, b: any) => a + Number(b), 0) : 0
              const vocabCount = s?.vocab_total_count ?? (distSum > 0 ? distSum : (l.vocabulary_items?.length ?? 0))
              const metrics = s?.recap_json?.metrics || {}
              return {
                lessonNumber: l.lesson_number,
                score: s?.score ?? null,
                talkPct: s?.talk_percentage ?? null,
                vocabCount,
                wpm: metrics.studentWpm ?? null,
                responseSec: metrics.avgResponseSec ?? null,
              }
            })}
          />
        </section>
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
                    <div style={{ fontWeight: 750, fontSize: 15, lineHeight: 1.3 }}>{lessonDisplayTitle(s?.recap_json, lesson.title, lesson.lesson_number)}</div>
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
