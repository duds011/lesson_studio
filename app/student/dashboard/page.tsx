import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStudentCredits } from '@/lib/credits'
import { getTeacherPaymentMethods } from '@/lib/payment-methods'
import { formatDateShort, lessonDisplayTitle, ordinal } from '@/lib/portal-utils'
import ProgressCharts from '@/components/portal/ProgressCharts'
import { MilestoneTrack, ScoreTrendChart, VocabLevelChart } from '@/components/portal/BrandCharts'
import CountUp from '@/components/portal/CountUp'
import LessonPillar, { PillarLesson } from '@/components/portal/LessonPillar'
import PaymentMethodsPanel from '@/components/portal/PaymentMethodsPanel'
import StudentLessonsBar, { BuyPkg } from '@/components/portal/StudentLessonsBar'
import DashboardTabs from '@/components/portal/DashboardTabs'
import { DASH_BLOCK_TAB, DASH_TABS, levelProgress, resolveBrand, type BlockId, type DashTab } from '@/lib/brand'

export const dynamic = 'force-dynamic'

const Icon = ({ d }: { d: string }) => (
  <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

export default async function StudentDashboard() {
  const supabase = await createClient()
  const user = await requireUser(supabase, '/student/dashboard')

  const { data: student } = await supabase.from('students').select('*').eq('profile_id', user.id).single()

  if (!student) {
    return (
      <div className="k-empty">
        <p style={{ fontSize: 34, margin: '0 0 8px' }}>⏳</p>
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
  const scoreDeltaNum = latestScore != null && firstScore != null ? latestScore - firstScore : null

  const talks = rows.map((l) => summaryOf(l)?.talk_percentage).filter((t) => t != null) as number[]
  const latestTalk = talks[0] ?? null
  const firstTalk = talks[talks.length - 1] ?? null
  const talkDelta = latestTalk != null && firstTalk != null ? latestTalk - firstTalk : null

  // Lessons in the last 30 days — drives the "new lessons" chip.
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentCount = rows.filter((l) => l.lesson_date && new Date(l.lesson_date).getTime() >= cutoff).length

  const metricAvg = (key: string) => {
    const vals = rows.map((l) => summaryOf(l)?.recap_json?.metrics?.[key]).filter((v) => typeof v === 'number') as number[]
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  }
  const avgWpm = metricAvg('studentWpm')
  const avgThinkSec = metricAvg('avgResponseSec')

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

  const { data: tests } = await supabase
    .from('tests')
    .select('id, title, level, published_at, lessons ( lesson_number )')
    .eq('student_id', student.id)
    .order('published_at', { ascending: false })

  const admin = createAdminClient()
  const [credits, paymentMethods, { data: pkgRows }, { data: teacherProfile }] = await Promise.all([
    getStudentCredits(admin, student.id),
    getTeacherPaymentMethods(admin, student.teacher_id),
    admin.from('lesson_packages').select('id, name, lessons_count, amount, currency').eq('teacher_id', student.teacher_id).eq('active', true).order('amount', { ascending: true }),
    admin.from('profiles').select('brand').eq('id', student.teacher_id).single(),
  ])
  const brand = resolveBrand((teacherProfile as any)?.brand)
  const buyPackages: BuyPkg[] = (pkgRows ?? []).map((p: any) => ({
    id: p.id, name: p.name, lessons_count: p.lessons_count, amount: Number(p.amount), currency: p.currency,
  }))

  // Where they are on the teacher's milestone ladder.
  const milestone = levelProgress(brand.levels, lessonCount)

  // The pillar reads earliest lesson first — `rows` comes back newest first.
  const pillarLessons: PillarLesson[] = rows
    .slice()
    .reverse()
    .map((lesson) => {
      const s = summaryOf(lesson)
      return {
        id: lesson.id as string,
        number: lesson.lesson_number as number,
        title: lessonDisplayTitle(s?.recap_json, lesson.title, lesson.lesson_number),
        meta: `${ordinal(lesson.lesson_number)} lesson · ${formatDateShort(lesson.lesson_date)}`,
        score: s?.score != null ? Number(s.score) : null,
        tag: `Lesson ${lesson.lesson_number}`,
      }
    })

  const firstName = student.full_name.split(' ')[0]
  // Most recent scored lessons, oldest-first so the chart reads left to right.
  const scoreTrend = rows
    .filter((l) => summaryOf(l)?.score != null)
    .slice(0, 6)
    .reverse()
    .map((l) => ({ lesson: l.lesson_number as number, score: Number(summaryOf(l).score) }))

  // Sizes the teacher set in the studio. A chart block spends its height on the
  // plot area (CHART_CHROME is the card padding + heading above it, so the block
  // as a whole lands on the height that was dragged); everything else gets the
  // height on its wrapper and scrolls what doesn't fit.
  const CHART_BLOCKS = new Set<BlockId>(['scores', 'vocab'])
  const CHART_CHROME = 74
  const sizeOf = (id: BlockId) => brand.layout.find((p) => p.id === id)
  const heightOf = (id: BlockId, fallback: number) => {
    const h = sizeOf(id)?.h
    return h ? Math.max(60, h - CHART_CHROME) : fallback
  }


  /** Every fixed string on this page is the teacher's to change. */
  const L = brand.labels

  // Each arrangeable block, keyed by id. The teacher's layout decides which
  // column each one sits in and in what order — see lib/brand.ts.
  const blocks: Partial<Record<BlockId, React.ReactNode>> = {
    hero: (
      <>
          <section className="k-hero">
            <h2 style={{ whiteSpace: 'pre-line' }}>{brand.headline}</h2>
            <p>
              {lessonCount > 0 && milestone.remaining > 0
                ? `You're ${milestone.remaining} lesson${milestone.remaining === 1 ? '' : 's'} away from ${milestone.label}. Keep the streak going.`
                : brand.welcome}
            </p>
            <Link href="/student/book" className="k-hero-btn">{L.heroButton}</Link>

            {brand.props !== 'none' && (
              <div className="k-hero-art" aria-hidden>
                {brand.props === 'orbs' && (
                  <>
                    <span className="k-orb" style={{ width: 104, height: 104, right: 34, top: 26 }} />
                    <span className="k-tube" style={{ width: 88, height: 88, right: 0, top: 74, transform: 'rotate(28deg)' }} />
                    <span className="k-crystal" style={{ width: 52, height: 60, right: 128, top: 96 }} />
                    <span className="k-ring" style={{ width: 44, height: 44, right: 150, top: 4 }} />
                  </>
                )}
                {brand.props === 'geometric' && (
                  <>
                    <span className="k-crystal" style={{ width: 74, height: 88, right: 30, top: 20 }} />
                    <span className="k-ring" style={{ width: 60, height: 60, right: 118, top: 76 }} />
                    <span className="k-crystal" style={{ width: 44, height: 52, right: 132, top: 8, opacity: .8 }} />
                  </>
                )}
                {brand.props === 'minimal' && (
                  <span className="k-ring" style={{ width: 86, height: 86, right: 44, top: 42 }} />
                )}
              </div>
            )}
          </section>
      </>
    ),
    stats: (
      <>
          <div className="k-stats">
            <div className="k-stat yellow">
              <div className="k-stat-head">
                <Icon d="M4 5h16v14H4zM4 9h16M9 9v10" />
                <span>{L.statLessons}</span>
              </div>
              <div className="k-stat-val">
                <b><CountUp value={lessonCount} /></b>
                {recentCount > 0 && <span className="k-chip">+{recentCount}</span>}
              </div>
              <p className="k-stat-sub">{recentCount > 0 ? `${recentCount} in the last 30 days` : 'Total lessons completed'}</p>
            </div>

            <div className="k-stat blue">
              <div className="k-stat-head">
                <Icon d="M12 3v18M5 10l7-7 7 7" />
                <span>{L.statScore}</span>
              </div>
              <div className="k-stat-val">
                <b>{avgScore != null ? <CountUp value={avgScore} decimals={1} /> : '—'}</b>
                {scoreDeltaNum != null && scoreDeltaNum !== 0 && (
                  <span className="k-chip">{scoreDeltaNum > 0 ? '▲' : '▼'} {Math.abs(scoreDeltaNum).toFixed(1)}</span>
                )}
              </div>
              <p className="k-stat-sub">out of 10 across {scores.length} scored lesson{scores.length === 1 ? '' : 's'}</p>
            </div>

            <div className="k-stat purple">
              <div className="k-stat-head">
                <Icon d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v3" />
                <span>{L.statSpeaking}</span>
              </div>
              <div className="k-stat-val">
                <b>{latestTalk != null ? <CountUp value={latestTalk} /> : '—'}<span style={{ fontSize: 19 }}>%</span></b>
                {talkDelta != null && talkDelta !== 0 && (
                  <span className="k-chip">{talkDelta > 0 ? '▲' : '▼'} {Math.abs(talkDelta)}%</span>
                )}
              </div>
              <p className="k-stat-sub">of the last lesson was you talking</p>
            </div>
          </div>
      </>
    ),
    lessons: (
      <>
          <div className="k-sec-head"><h2>{L.lessonsTitle}</h2><span className="k-link">{pillarLessons.length} in all</span></div>
          <LessonPillar lessons={pillarLessons} />
      </>
    ),
    progress: (
      <>
          {brand.showProgress && lessonCount >= 2 && (
            <>
              <div className="k-sec-head"><h2>{L.progressTitle}</h2></div>
              <div className="k-card">
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
              </div>
            </>
          )}
      </>
    ),
    vocab: (
      <>
          {brand.showVocab && totalVocab > 0 && (
            <>
              <div className="k-sec-head"><h2>{L.vocabTitle}</h2><span className="k-link">{totalVocab} words</span></div>
              <div className="k-card k-chart-card">
                <div className="k-chart-fill">
                  <VocabLevelChart distribution={vocabDistribution} height={sizeOf('vocab')?.h ? heightOf('vocab', 170) : '100%'} />
                </div>
              </div>
            </>
          )}
      </>
    ),
    milestone: (
      <>
          {brand.showMilestone && <div className="k-card">
            <div className="k-card-head">
              <h3>{L.milestoneTitle}</h3>
              <span className="k-link">{milestone.label}</span>
            </div>
            <MilestoneTrack levels={brand.levels} lessonCount={lessonCount} color={brand.accent} />
            <p className="k-course-meta" style={{ marginTop: 11 }}>
              {milestone.remaining > 0
                ? `${lessonCount} of ${milestone.target} lessons towards ${milestone.label}`
                : `Every level cleared — ${lessonCount} lessons in.`}
            </p>
          </div>}
      </>
    ),
    scores: (
      <>
          {scoreTrend.length > 0 && (
            <div className="k-card k-chart-card">
              <div className="k-card-head">
                <h3>{L.scoresTitle}</h3>
                <span className="k-link">Last {scoreTrend.length}</span>
              </div>
              <div className="k-chart-fill">
                <ScoreTrendChart points={scoreTrend} color={brand.accent} height={sizeOf('scores')?.h ? heightOf('scores', 150) : '100%'} />
              </div>
            </div>
          )}
      </>
    ),
    tests: (
      <>
          {brand.showTests && (tests ?? []).length > 0 && (
            <div className="k-card">
              <div className="k-card-head">
                <h3>{L.testsTitle}</h3>
                <span className="k-link">{(tests as any[]).length}</span>
              </div>
              <div className="k-hw">
                {(tests as any[]).map((t) => {
                  const lesson = Array.isArray(t.lessons) ? t.lessons[0] : t.lessons
                  return (
                    <Link key={t.id} href={`/student/tests/${t.id}`} className="k-hw-row">
                      <div className="k-hw-top">
                        <div>
                          <div className="k-hw-title">{t.title}</div>
                          <div className="k-hw-due">
                            {lesson ? `From lesson ${lesson.lesson_number} · ` : ''}{formatDateShort(t.published_at)}
                          </div>
                        </div>
                        <span className="k-btn-pill">Start</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
      </>
    ),
    speaking: (
      <>
          {brand.showSpeaking && (avgWpm != null || avgThinkSec != null) && (
            <div className="k-card">
              <div className="k-card-head"><h3>{L.speakingTitle}</h3></div>
              <div style={{ display: 'grid', gap: 11, flex: 1, alignContent: 'center' }}>
                {avgWpm != null && (
                  <div className="k-hw-top">
                    <div className="k-hw-title">Pace</div>
                    <div className="k-score">{Math.round(avgWpm)} wpm</div>
                  </div>
                )}
                {avgThinkSec != null && (
                  <div className="k-hw-top">
                    <div className="k-hw-title">Thinking time</div>
                    <div className="k-score">{avgThinkSec.toFixed(1)}s</div>
                  </div>
                )}
              </div>
            </div>
          )}
      </>
    ),
  }

  // Whether each block has anything to render — mirrors the conditions inside
  // the blocks above, and decides whether it takes a slot in the flow at all.
  const hasContent: Record<BlockId, boolean> = {
    hero: brand.showHero,
    stats: brand.showStats,
    lessons: brand.showLessons,
    progress: brand.showProgress && lessonCount >= 2,
    vocab: brand.showVocab && totalVocab > 0,
    milestone: brand.showMilestone,
    scores: brand.showScores && scoreTrend.length > 0,
    tests: brand.showTests && (tests ?? []).length > 0,
    speaking: brand.showSpeaking && (avgWpm != null || avgThinkSec != null),
  }

  /** The teacher's order, minus anything switched off or with nothing to say. */
  const placed = brand.layout.filter(({ id }) => hasContent[id])
  const tabs = DASH_TABS
    .map((tab) => ({
      id: tab as DashTab,
      label: L[`tab${tab}` as 'tabOverview' | 'tabLessons' | 'tabProgress'],
      blocks: placed.filter(({ id }) => DASH_BLOCK_TAB[id] === tab),
    }))
    .filter((t) => t.blocks.length > 0)

  return (
    <>
      {/* ── top bar ── */}
      <div className="k-top">
        <div>
          <p className="k-hello">{L.greeting}</p>
          <h1 className="k-name">{firstName}</h1>
        </div>
        <div className="k-top-tools">
          <label className="k-search">
            <Icon d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4" />
            <input placeholder="Search lessons" aria-label="Search lessons" />
          </label>
          <button className="k-bell" aria-label="Notifications">
            <Icon d="M18 16V11a6 6 0 1 0-12 0v5l-2 3h16zM10 22h4" />
          </button>
        </div>
      </div>

      <div className="k-flow" style={{ marginTop: 16 }}>
        <div style={{ ['--w' as any]: 12 }}>
          <StudentLessonsBar credits={credits} packages={buyPackages} />
          <PaymentMethodsPanel methods={paymentMethods} />
        </div>
      </div>

      {/* One tab at a time, so the page is a screen rather than a scroll.
          Inside a tab each block sits where the teacher put it, at the width
          and height they gave it; a sized block becomes a size container so
          its text scales to the box — see .k-fit in koku2.css. */}
      <DashboardTabs
        tabs={tabs.map(({ id, label, blocks: placements }) => ({
          id,
          label,
          content: placements.map(({ id: blockId, w, h }) => (
            <div
              key={blockId}
              style={{ ['--w' as any]: w, ...(h ? { height: h } : null) }}
              className={h ? 'k-fit' : undefined}
            >
              {h ? <div className={`k-fit-body ${CHART_BLOCKS.has(blockId) ? '' : 'k-block-sized'}`}>{blocks[blockId]}</div> : blocks[blockId]}
            </div>
          )),
        }))}
      />
    </>
  )
}
