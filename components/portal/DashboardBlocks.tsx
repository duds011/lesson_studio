import Link from 'next/link'
import ProgressCharts from './ProgressCharts'
import { MilestoneTrack, ScoreTrendChart } from './BrandCharts'
import VocabLevelBreakdown from './VocabLevelBreakdown'
import CountUp from './CountUp'
import LessonPillar, { PillarLesson } from './LessonPillar'
import { levelProgress, type Brand, type BlockId } from '@/lib/brand'

/**
 * Every block on the student dashboard, in one place.
 *
 * The branding studio used to draw its own imitation of this page — a second
 * set of components that looked roughly like the real ones. They drifted:
 * change a chart here and the teacher's preview kept showing the old one, so
 * what a teacher designed was never quite what their student opened. Both
 * sides now render this, so they cannot disagree.
 *
 * Nothing in here reads from the database. The real page passes a student's
 * numbers, the studio passes made-up ones, and the markup is identical.
 */

export type DashboardData = {
  lessonCount: number
  recentCount: number
  scoredCount: number
  avgScore: number | null
  scoreDelta: number | null
  latestTalk: number | null
  talkDelta: number | null
  pillarLessons: PillarLesson[]
  progressLessons: {
    lessonNumber: number
    score: number | null
    talkPct: number | null
    vocabCount: number
    wpm?: number | null
    responseSec?: number | null
  }[]
  vocabDistribution: Record<string, number>
  totalVocab: number
  scoreTrend: { lesson: number; score: number }[]
  tests: { id: string; title: string; lessonNumber: number | null; date: string | null }[]
  avgWpm: number | null
  avgThinkSec: number | null
  files: { id: string; fileName: string; lessonId: string; lessonNumber: number | null; date: string | null }[]
}

/** The studio's canvas is a picture of a page, not the page — nothing in it
 *  should navigate, and its charts should not animate on every re-render. */
type Mode = { preview?: boolean }

const Icon = ({ d }: { d: string }) => (
  <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

/** A link on the real page, inert text in the preview. */
function Go({ href, className, children, preview }: { href: string; className?: string; children: React.ReactNode; preview?: boolean }) {
  if (preview) return <span className={className}>{children}</span>
  return <Link href={href} className={className}>{children}</Link>
}

/**
 * The fixed arrangement. The teacher used to drag these around and pull their
 * edges; a layout they could break in a hundred ways bought less than it cost,
 * so the shape is ours and the styling is theirs. `w` is the share of a
 * 12-column row — see .k-flow.
 */
export const DASHBOARD_LAYOUT: { id: BlockId; w: number }[] = [
  { id: 'stats', w: 12 },
  { id: 'scores', w: 7 }, { id: 'milestone', w: 5 },
  { id: 'lessons', w: 12 },
  { id: 'vocab', w: 12 },
  { id: 'progress', w: 12 },
  { id: 'speaking', w: 12 },
  { id: 'files', w: 12 },
  { id: 'tests', w: 12 },
]

/** Whether a block has anything to say for this student. */
export function blockHasContent(id: BlockId, brand: Brand, d: DashboardData): boolean {
  switch (id) {
    case 'stats': return brand.showStats
    case 'lessons': return brand.showLessons && d.pillarLessons.length > 0
    case 'progress': return brand.showProgress && d.progressLessons.length >= 2
    case 'vocab': return brand.showVocab && d.totalVocab > 0
    case 'milestone': return brand.showMilestone
    case 'scores': return brand.showScores && d.scoreTrend.length > 0
    case 'tests': return brand.showTests && d.tests.length > 0
    case 'speaking': return brand.showSpeaking && (d.avgWpm != null || d.avgThinkSec != null)
    case 'files': return brand.showFiles && d.files.length > 0
    default: return false
  }
}

export function DashboardBlock({ id, brand, data: d, preview }: { id: BlockId; brand: Brand; data: DashboardData } & Mode) {
  const L = brand.labels
  const milestone = levelProgress(brand.levels, d.lessonCount)

  switch (id) {
    case 'stats':
      return (
        <div className="k-stats">
          <div className="k-stat yellow">
            <div className="k-stat-head"><Icon d="M4 5h16v14H4zM4 9h16M9 9v10" /><span>{L.statLessons}</span></div>
            <div className="k-stat-val">
              <b><CountUp value={d.lessonCount} /></b>
              {d.recentCount > 0 && <span className="k-chip">+{d.recentCount}</span>}
            </div>
            <p className="k-stat-sub">{d.recentCount > 0 ? `${d.recentCount} in the last 30 days` : 'Total lessons completed'}</p>
          </div>

          <div className="k-stat blue">
            <div className="k-stat-head"><Icon d="M12 3v18M5 10l7-7 7 7" /><span>{L.statScore}</span></div>
            <div className="k-stat-val">
              <b>{d.avgScore != null ? <CountUp value={d.avgScore} decimals={1} /> : '—'}</b>
              {d.scoreDelta != null && d.scoreDelta !== 0 && (
                <span className="k-chip">{d.scoreDelta > 0 ? '▲' : '▼'} {Math.abs(d.scoreDelta).toFixed(1)}</span>
              )}
            </div>
            <p className="k-stat-sub">out of 10 across {d.scoredCount} scored lesson{d.scoredCount === 1 ? '' : 's'}</p>
          </div>

          <div className="k-stat purple">
            <div className="k-stat-head"><Icon d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v3" /><span>{L.statSpeaking}</span></div>
            <div className="k-stat-val">
              <b>{d.latestTalk != null ? <CountUp value={d.latestTalk} /> : '—'}<span style={{ fontSize: 19 }}>%</span></b>
              {d.talkDelta != null && d.talkDelta !== 0 && (
                <span className="k-chip">{d.talkDelta > 0 ? '▲' : '▼'} {Math.abs(d.talkDelta)}%</span>
              )}
            </div>
            <p className="k-stat-sub">of the last lesson was you talking</p>
          </div>
        </div>
      )

    case 'lessons':
      return (
        <>
          <div className="k-sec-head"><h2>{L.lessonsTitle}</h2><span className="k-link">{d.pillarLessons.length} in all</span></div>
          <LessonPillar lessons={d.pillarLessons} preview={preview} />
        </>
      )

    case 'progress':
      return (
        <>
          <div className="k-sec-head"><h2>{L.progressTitle}</h2></div>
          <div className="k-card"><ProgressCharts lessons={d.progressLessons} /></div>
        </>
      )

    case 'vocab':
      return (
        <>
          <div className="k-sec-head"><h2>{L.vocabTitle}</h2><span className="k-link">{d.totalVocab} words</span></div>
          <div className="k-card">
            <VocabLevelBreakdown distribution={d.vocabDistribution} totalCount={d.totalVocab} plain />
          </div>
        </>
      )

    case 'milestone':
      return (
        <div className="k-card">
          <div className="k-card-head"><h3>{L.milestoneTitle}</h3><span className="k-link">{milestone.label}</span></div>
          <MilestoneTrack levels={brand.levels} lessonCount={d.lessonCount} color={brand.accent} />
          <p className="k-course-meta" style={{ marginTop: 11 }}>
            {milestone.remaining > 0
              ? `${d.lessonCount} of ${milestone.target} lessons towards ${milestone.label}`
              : `Every level cleared — ${d.lessonCount} lessons in.`}
          </p>
        </div>
      )

    case 'scores':
      return (
        <div className="k-card k-chart-card">
          <div className="k-card-head"><h3>{L.scoresTitle}</h3><span className="k-link">Last {d.scoreTrend.length}</span></div>
          <div className="k-chart-fill"><ScoreTrendChart points={d.scoreTrend} color={brand.accent} height="100%" /></div>
        </div>
      )

    case 'tests':
      return (
        <div className="k-card">
          <div className="k-card-head"><h3>{L.testsTitle}</h3><span className="k-link">{d.tests.length}</span></div>
          <div className="k-hw">
            {d.tests.map((t) => (
              <Go key={t.id} href={`/student/tests/${t.id}`} className="k-hw-row" preview={preview}>
                <div className="k-hw-top">
                  <div>
                    <div className="k-hw-title">{t.title}</div>
                    <div className="k-hw-due">{t.lessonNumber ? `From lesson ${t.lessonNumber} · ` : ''}{t.date}</div>
                  </div>
                  <span className="k-btn-pill">Start</span>
                </div>
              </Go>
            ))}
          </div>
        </div>
      )

    case 'speaking':
      // Same colourful rectangles as the overview stats, so the page reads as
      // one system rather than a card of small print at the bottom.
      return (
        <>
          <div className="k-sec-head"><h2>{L.speakingTitle}</h2></div>
          <div className="k-speak-grid">
            {d.avgWpm != null && (
              <div className="k-stat blue">
                <div className="k-stat-head"><Icon d="M13 3 4 14h6l-1 7 9-11h-6z" /><span>Pace</span></div>
                <div className="k-stat-val">
                  <b><CountUp value={Math.round(d.avgWpm)} /><span style={{ fontSize: 17 }}> wpm</span></b>
                </div>
                <p className="k-stat-sub">words per minute when you speak</p>
              </div>
            )}
            {d.avgThinkSec != null && (
              <div className="k-stat purple">
                <div className="k-stat-head"><Icon d="M12 8v4l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /><span>Thinking time</span></div>
                <div className="k-stat-val">
                  <b><CountUp value={d.avgThinkSec} decimals={1} /><span style={{ fontSize: 17 }}> s</span></b>
                </div>
                <p className="k-stat-sub">average pause before you answer</p>
              </div>
            )}
            {d.latestTalk != null && (
              <div className="k-stat yellow">
                <div className="k-stat-head"><Icon d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v3" /><span>Your share</span></div>
                <div className="k-stat-val">
                  <b><CountUp value={d.latestTalk} /><span style={{ fontSize: 17 }}>%</span></b>
                </div>
                <p className="k-stat-sub">of the last lesson was you talking</p>
              </div>
            )}
          </div>
        </>
      )

    case 'files':
      // Everything the teacher has shared, newest first. Each file also lives
      // on its lesson's recap — this is the one place to find them all.
      return (
        <>
          <div className="k-sec-head"><h2>{L.filesTitle}</h2><span className="k-link">{d.files.length}</span></div>
          <div className="k-card">
            <div className="k-hw">
              {d.files.map((f) => (
                <div key={f.id} className="k-hw-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="k-file-ic" aria-hidden>
                    <Icon d="M14 3v5h5M6 3h8l5 5v13H6z" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="k-hw-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName}</div>
                    <div className="k-hw-due">
                      {f.lessonNumber != null ? `Lesson ${f.lessonNumber}` : 'Lesson'}{f.date ? ` · ${f.date}` : ''}
                    </div>
                  </div>
                  {preview ? (
                    <span className="k-btn-pill">Download</span>
                  ) : (
                    <a className="k-btn-pill" href={`/api/portal/download?kind=file&id=${f.id}`}>Download</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )

    default:
      return null
  }
}
