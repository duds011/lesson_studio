import Link from 'next/link'
import { fill, rich, type Messages } from '@/lib/i18n'
import ProgressCharts from './ProgressCharts'
import VocabLevelBreakdown from './VocabLevelBreakdown'
import VocabByLevel from './VocabByLevel'
import { MilestoneTrack, ScoreTrendChart } from './BrandCharts'
import CountUp from './CountUp'
import LessonPillar, { PillarLesson } from './LessonPillar'
import { DASH_SPEAK_TILES, DASH_STAT_TILES, levelProgress, type Brand, type BlockId, type DashSpeakId, type DashStatId } from '@/lib/brand'
import { SESSION_SIZE } from '@/lib/flashcards'

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
  /** Practice decks, sized and filtered — empty ones never reach here. */
  decks: { id: string; label: string; sub: string; tone: string; total: number; due: number; known: number }[]
  /** The same words cut by lesson, for "the ones from last Tuesday". */
  cardLessons: { id: string; number: number | null; title: string; total: number; due: number }[]
  /** Where the collection stands: known / learning / never practised. */
  cardMastery: { known: number; learning: number; new: number }
  /** Cards practised per day, oldest first — empty when there is no history. */
  practiceDays: { day: string; label: string; cards: number }[]
  cardTotal: number
  cardDue: number
  /** Talk share in the earliest scored lesson — the gauge's starting mark. */
  firstTalk: number | null
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
  /** Distinct words, newest first, each attributed to where it first appeared. */
  vocabWords: {
    word: string
    reading: string | null
    definition: string | null
    level: string | null
    isKey?: boolean
    firstLessonNumber: number | null
    firstDate: string | null
    lessonCount: number
  }[]
  scoreTrend: { lesson: number; score: number }[]
  tests: {
    id: string; title: string; level: string | null
    lessonNumber: number | null; date: string | null
    /** Null until the student has finished it — that is what splits the two states. */
    score: number | null; correct: number | null; total: number | null; takenOn: string | null
  }[]
  avgWpm: number | null
  avgThinkSec: number | null
  files: { id: string; fileName: string; lessonId: string; lessonNumber: number | null; date: string | null }[]
}

/** The studio's canvas is a picture of a page, not the page — nothing in it
 *  should navigate, and its charts should not animate on every re-render. The
 *  onRemove* callbacks are studio-only too: per-tile ✕s for the stat cards and
 *  the speaking tiles, never rendered on a student's page. */
type Mode = {
  preview?: boolean
  onRemoveStat?: (id: DashStatId) => void
  onRemoveSpeak?: (id: DashSpeakId) => void
}

/** The studio's small per-tile remove button — see .k-zap in koku2.css. */
function TileX({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="k-zap-x k-zap-x-sm" aria-label={`Remove ${label}`} title={`Remove ${label}`} onClick={onClick}>✕</button>
  )
}

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
  // Overview reads top to bottom, each band the full width: the three figures,
  // then where they are heading, then what they have collected, then how each
  // lesson went. Side by side, the milestone and the scores each got half a
  // page and neither had room to say anything.
  { id: 'stats', w: 12 },
  { id: 'milestone', w: 12 },
  { id: 'vocabTotals', w: 12 },
  { id: 'scores', w: 12 },
  { id: 'lessons', w: 12 },
  // Progress opens with how they sound, then the trends, then the words.
  { id: 'speaking', w: 12 },
  { id: 'progress', w: 12 },
  { id: 'vocab', w: 12 },
  // Practice sits with the words it is made of.
  { id: 'flashcards', w: 12 },
  { id: 'files', w: 12 },
  { id: 'tests', w: 12 },
]

/** Whether a block has anything to say for this student. */
export function blockHasContent(id: BlockId, brand: Brand, d: DashboardData): boolean {
  switch (id) {
    case 'stats': return brand.showStats && (brand.hiddenStats?.length ?? 0) < DASH_STAT_TILES.length
    case 'lessons': return brand.showLessons && d.pillarLessons.length > 0
    case 'progress': return brand.showProgress && d.progressLessons.length >= 2
    case 'vocab': return brand.showVocab && d.vocabWords.length > 0
    case 'vocabTotals': return brand.showVocabTotals && d.totalVocab > 0
    case 'milestone': return brand.showMilestone
    case 'scores': return brand.showScores && d.scoreTrend.length > 0
    case 'tests': return brand.showTests && d.tests.length > 0
    case 'speaking': {
      // A tile needs both its data and its switch — the block stays only while
      // at least one tile has both.
      const hid = brand.hiddenSpeaking ?? []
      return brand.showSpeaking && (
        (d.avgWpm != null && !hid.includes('pace'))
        || (d.avgThinkSec != null && !hid.includes('think'))
        || (d.latestTalk != null && !hid.includes('share'))
      )
    }
    case 'flashcards': return brand.showFlashcards && d.decks.length > 0
    case 'files': return brand.showFiles && d.files.length > 0
    default: return false
  }
}

/**
 * `copy` arrives as a prop rather than from useT().
 *
 * This component renders in two places with two different readers: the
 * student's dashboard, on the server, in the student's language; and the
 * teacher's Branding Studio preview, on the client, in the teacher's. A hook
 * only works in one of them and getDict needs a locale nobody here has, so
 * the caller — which knows whose screen this is — hands the words in.
 */
export function DashboardBlock({ id, brand, data: d, copy, dict, preview, onRemoveStat, onRemoveSpeak }: { id: BlockId; brand: Brand; data: DashboardData; copy: Messages['portal']; dict: Messages } & Mode) {
  const L = brand.labels
  const milestone = levelProgress(brand.levels, d.lessonCount)

  switch (id) {
    case 'stats': {
      const hid = brand.hiddenStats ?? []

      /**
       * The dashboard's job is to answer "am I getting better?" before you
       * scroll, and three stat tiles never did. The one number that moved is
       * the share of the lesson this student did the talking in, so it becomes
       * the page: an arc for where they are now, a mark for where they began.
       *
       * Falls back to the tiles when there is nothing to compare yet — a first
       * lesson has no journey, and an arc with the mark under the needle would
       * be a worse way to say so.
       */
      const canArc = !hid.includes('speaking') && d.latestTalk != null
        && d.firstTalk != null && d.talkDelta != null && d.scoredCount > 1
      if (canArc) {
        const now = d.latestTalk as number
        const then = d.firstTalk as number
        const delta = d.talkDelta as number
        // A half circle: 0% at the left, 100% at the right.
        const R = 132, CX = 165, CY = 170, SW = 22
        const pt = (v: number) => {
          const a = Math.PI * (1 - v / 100)
          return [CX + Math.cos(a) * R, CY - Math.sin(a) * R] as const
        }
        const arc = (to: number) => {
          const A = pt(0), B = pt(to)
          // large-arc-flag stays 0: the sweep is never more than a half turn.
          return `M${A[0].toFixed(1)} ${A[1].toFixed(1)} A${R} ${R} 0 0 1 ${B[0].toFixed(1)} ${B[1].toFixed(1)}`
        }
        const mark = pt(then)
        const ma = Math.PI * (1 - then / 100)
        const headline = delta > 0
          ? (now >= 50
            ? <>{rich(copy.climbLed, { em: <em>{copy.climbLedEm}</em> })}</>
            : <>{rich(copy.climbMore, { em: <em>{fill(copy.climbMoreEm, { delta })}</em> })}</>)
          : <>{rich(copy.climbPlain, { em: <em>{now}%</em> })}</>

        const strip = DASH_STAT_TILES
          .filter(({ id: sid }) => sid !== 'speaking' && !hid.includes(sid))
          .map(({ id: sid, label }) => (
            <div className={`k-climb-stat ${onRemoveStat ? 'k-zap' : ''}`} key={sid}>
              {onRemoveStat && <TileX label={label} onClick={() => onRemoveStat(sid)} />}
              <b>
                {sid === 'lessons'
                  ? <CountUp value={d.lessonCount} />
                  : d.avgScore != null ? <CountUp value={d.avgScore} decimals={1} /> : '—'}
              </b>
              <s>{sid === 'lessons' ? L.statLessons : L.statScore}</s>
            </div>
          ))

        return (
          <div className={`k-climb ${onRemoveStat ? 'k-zap' : ''}`}>
            {onRemoveStat && <TileX label="Speaking share" onClick={() => onRemoveStat('speaking')} />}
            <div className="k-climb-arc">
              <svg viewBox="0 0 330 196" role="img"
                   aria-label={`You spoke ${now} percent of your last lesson, up from ${then} percent`}>
                <path d={arc(100)} fill="none" stroke="var(--surface-2)" strokeWidth={SW} strokeLinecap="round" />
                <path className="k-climb-fill" d={arc(now)} fill="none" stroke="var(--forest)"
                      strokeWidth={SW} strokeLinecap="round" pathLength={100} />
                <line
                  x1={(mark[0] - Math.cos(ma) * 14).toFixed(1)} y1={(mark[1] + Math.sin(ma) * 14).toFixed(1)}
                  x2={(mark[0] + Math.cos(ma) * 14).toFixed(1)} y2={(mark[1] - Math.sin(ma) * 14).toFixed(1)}
                  stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" opacity=".5"
                />
              </svg>
              <div className="k-climb-mid">
                <b><CountUp value={now} /><span>%</span></b>
                <s>{copy.youSpoke}</s>
              </div>
            </div>
            <div className="k-climb-copy">
              <div className="k-climb-eyebrow">{d.lessonCount === 1 ? copy.acrossOneLesson : fill(copy.acrossLessons, { n: d.lessonCount })}</div>
              <h2 className="k-climb-line">{headline}</h2>
              <p className="k-climb-sub">{rich(copy.climbSub, { then: <b>{then}%</b> })}</p>
              {delta > 0 && <span className="k-climb-delta">▲ {fill(copy.climbDelta, { delta })}</span>}
              {strip.length > 0 && <div className="k-climb-strip">{strip}</div>}
            </div>
          </div>
        )
      }

      // One entry per card, so the teacher keeps the average and drops the
      // talk-share (or any mix) instead of all three or none.
      const CARD: Record<DashStatId, React.ReactNode> = {
        lessons: (
          <>
            <div className="k-stat-head"><Icon d="M4 5h16v14H4zM4 9h16M9 9v10" /><span>{L.statLessons}</span></div>
            <div className="k-stat-val">
              <b><CountUp value={d.lessonCount} /></b>
              {d.recentCount > 0 && <span className="k-chip">+{d.recentCount}</span>}
            </div>
            <p className="k-stat-sub">{d.recentCount > 0 ? fill(copy.inLast30, { n: d.recentCount }) : copy.totalLessons}</p>
          </>
        ),
        score: (
          <>
            <div className="k-stat-head"><Icon d="M12 3v18M5 10l7-7 7 7" /><span>{L.statScore}</span></div>
            <div className="k-stat-val">
              <b>{d.avgScore != null ? <CountUp value={d.avgScore} decimals={1} /> : '—'}</b>
              {d.scoreDelta != null && d.scoreDelta !== 0 && (
                <span className="k-chip">{d.scoreDelta > 0 ? '▲' : '▼'} {Math.abs(d.scoreDelta).toFixed(1)}</span>
              )}
            </div>
            <p className="k-stat-sub">out of 10 across {d.scoredCount} scored lesson{d.scoredCount === 1 ? '' : 's'}</p>
          </>
        ),
        speaking: (
          <>
            <div className="k-stat-head"><Icon d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v3" /><span>{L.statSpeaking}</span></div>
            <div className="k-stat-val">
              <b>{d.latestTalk != null ? <CountUp value={d.latestTalk} /> : '—'}<span style={{ fontSize: 19 }}>%</span></b>
              {d.talkDelta != null && d.talkDelta !== 0 && (
                <span className="k-chip">{d.talkDelta > 0 ? '▲' : '▼'} {Math.abs(d.talkDelta)}%</span>
              )}
            </div>
            <p className="k-stat-sub">of the last lesson was you talking</p>
          </>
        ),
      }
      const TONE: Record<DashStatId, string> = { lessons: 'yellow', score: 'blue', speaking: 'purple' }
      const cards = DASH_STAT_TILES.filter(({ id: sid }) => !hid.includes(sid))
      if (cards.length === 0) return null
      return (
        <div className="k-stats">
          {cards.map(({ id: sid, label }) => (
            <div className={`k-stat ${TONE[sid]} ${onRemoveStat ? 'k-zap' : ''}`} key={sid}>
              {onRemoveStat && <TileX label={label} onClick={() => onRemoveStat(sid)} />}
              {CARD[sid]}
            </div>
          ))}
        </div>
      )
    }

    case 'lessons':
      return (
        <>
          <div className="k-sec-head"><h2>{L.lessonsTitle}</h2><span className="k-link">{fill(copy.inAll, { n: d.pillarLessons.length })}</span></div>
          <LessonPillar lessons={d.pillarLessons} preview={preview} t={dict} />
        </>
      )

    case 'progress':
      return (
        <>
          <div className="k-sec-head"><h2>{L.progressTitle}</h2></div>
          <div className="k-card"><ProgressCharts lessons={d.progressLessons} /></div>
        </>
      )

    case 'vocabTotals':
      // The overview's answer to "how much have I picked up" — the totals bar
      // only. The words themselves are a Progress-tab read, not a glance.
      return (
        <>
          <div className="k-sec-head"><h2>{L.vocabTotalsTitle}</h2><span className="k-link">{fill(copy.words, { n: d.totalVocab })}</span></div>
          <div className="k-card">
            <VocabLevelBreakdown distribution={d.vocabDistribution} totalCount={d.totalVocab} plain />
          </div>
        </>
      )

    case 'vocab':
      // The bar first, the words on request. Listing all of them made this a
      // wall of text people scrolled past; "how much, at what level" is the
      // question a glance asks, and a level opens to answer "which words".
      return (
        <>
          <div className="k-sec-head"><h2>{L.vocabTitle}</h2><span className="k-link">{fill(copy.words, { n: d.vocabWords.length })}</span></div>
          <div className="k-card">
            <VocabByLevel words={d.vocabWords} />
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
          <div className="k-card-head"><h3>{L.scoresTitle}</h3><span className="k-link">{fill(copy.lastN, { n: d.scoreTrend.length })}</span></div>
          <div className="k-chart-fill"><ScoreTrendChart points={d.scoreTrend} color={brand.accent} height="100%" /></div>
        </div>
      )

    case 'tests':
      return (
        <div className="k-card">
          <div className="k-card-head"><h3>{L.testsTitle}</h3><span className="k-link">{d.tests.length}</span></div>
          {/* Deliberately not the homework row used elsewhere: a test is an
              event, not another line in a list, and it has two states worth
              telling apart at a glance — waiting to be taken, or scored. */}
          <div className="k-tests">
            {d.tests.map((t) => {
              const done = t.score !== null
              // A score is feedback, so it should not all look like praise —
              // 45% rendered in the same green as 82% tells the student they
              // did well when they did not.
              const tone = !done ? '' : t.score! >= 70 ? ' is-good' : t.score! >= 50 ? ' is-mid' : ' is-low'
              return (
                <Go
                  key={t.id}
                  href={`/student/tests/${t.id}`}
                  className={`k-test${done ? ' is-done' : ''}${tone}`}
                  preview={preview}
                >
                  <span className="k-test-mark" aria-hidden>{done ? `${t.score}%` : '✎'}</span>
                  <span className="k-test-body">
                    <span className="k-test-title">{t.title}</span>
                    <span className="k-test-meta">
                      {t.level ? `${t.level} · ` : ''}
                      {t.lessonNumber ? `Lesson ${t.lessonNumber} · ` : ''}
                      {done ? `Scored ${t.correct}/${t.total} on ${t.takenOn}` : t.date}
                    </span>
                  </span>
                  <span className="k-test-cta">{done ? 'Review' : 'Start'}</span>
                </Go>
              )
            })}
          </div>
        </div>
      )

    case 'speaking': {
      // Same colourful rectangles as the overview stats, so the page reads as
      // one system rather than a card of small print at the bottom. Tiles show
      // when they have data AND the teacher keeps them — any mix stands.
      const hid = brand.hiddenSpeaking ?? []
      const tiles: { id: DashSpeakId; label: string; node: React.ReactNode }[] = []
      if (d.avgWpm != null && !hid.includes('pace')) tiles.push({
        id: 'pace', label: copy.metricPace,
        node: (
          <>
            <div className="k-stat-head"><Icon d="M13 3 4 14h6l-1 7 9-11h-6z" /><span>Pace</span></div>
            <div className="k-stat-val">
              <b><CountUp value={Math.round(d.avgWpm)} /><span style={{ fontSize: 17 }}> wpm</span></b>
            </div>
            <p className="k-stat-sub">words per minute when you speak</p>
          </>
        ),
      })
      if (d.avgThinkSec != null && !hid.includes('think')) tiles.push({
        id: 'think', label: copy.metricThinking,
        node: (
          <>
            <div className="k-stat-head"><Icon d="M12 8v4l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" /><span>{copy.metricThinking}</span></div>
            <div className="k-stat-val">
              <b><CountUp value={d.avgThinkSec} decimals={1} /><span style={{ fontSize: 17 }}> s</span></b>
            </div>
            <p className="k-stat-sub">average pause before you answer</p>
          </>
        ),
      })
      if (d.latestTalk != null && !hid.includes('share')) tiles.push({
        id: 'share', label: copy.metricShare,
        node: (
          <>
            <div className="k-stat-head"><Icon d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v3" /><span>{copy.metricShare}</span></div>
            <div className="k-stat-val">
              <b><CountUp value={d.latestTalk} /><span style={{ fontSize: 17 }}>%</span></b>
            </div>
            <p className="k-stat-sub">of the last lesson was you talking</p>
          </>
        ),
      })
      if (tiles.length === 0) return null
      const SPEAK_TONE: Record<DashSpeakId, string> = { pace: 'blue', think: 'purple', share: 'yellow' }
      return (
        <>
          <div className="k-sec-head"><h2>{L.speakingTitle}</h2></div>
          <div className="k-speak-grid">
            {tiles.map(({ id: sid, label, node }) => (
              <div className={`k-stat ${SPEAK_TONE[sid]} ${onRemoveSpeak ? 'k-zap' : ''}`} key={sid}>
                {onRemoveSpeak && <TileX label={label} onClick={() => onRemoveSpeak(sid)} />}
                {node}
              </div>
            ))}
          </div>
        </>
      )
    }

    case 'flashcards': {
      // Decks are already filtered to the ones with cards, so a student who has
      // only ever met nouns sees one deck rather than five empty boxes.
      //
      // A deck leads with how many are DUE, not how many exist. The total was
      // the wrong number to set in 28pt: it only ever grows, it is never what
      // is being asked of anyone, and a term in it reads as a backlog.
      const nothingDue = d.cardDue === 0
      const firstRound = Math.min(SESSION_SIZE, Math.max(d.cardDue, 1))
      const m = d.cardMastery
      const days = d.practiceDays
      const busiest = Math.max(1, ...days.map((x) => x.cards))
      // Every word met is either known, on its way, or untouched. This is the
      // answer to "am I getting anywhere" — due counts only say how much is
      // waiting, which goes up as often as it goes down.
      const bands = [
        { k: 'known' as const, label: copy.vocabKnown, tone: '#1c7f52' },
        { k: 'learning' as const, label: copy.vocabLearning, tone: '#0a61c9' },
        { k: 'new' as const, label: copy.vocabNew, tone: '#c8ccd2' },
      ]
      return (
        <>
          <div className="k-sec-head">
            <h2>{copy.practiseTitle}</h2>
          </div>

          {/* Where the collection stands, and how the fortnight has gone. */}
          <div className="k-card">
            <div className="k-mastery">
              {/*
                Leads with words STARTED, not words known.

                A word counts as known at box 3, which takes three correct
                answers on three different days -- the boxes are spaced 1, 3 and
                7 days apart. So "known" is structurally incapable of moving
                during a session: a student could practise perfectly for twenty
                minutes and watch the headline number sit still, which reads as
                the feature being broken rather than as spacing working.

                Started moves the moment a card is answered, which is the honest
                answer to "did what I just do count". Known is still on the bar
                and in the key, where it is a milestone rather than the only
                score.
              */}
              <div className="k-mastery-head">
                <b>{m.known + m.learning}</b>
                <span>of {d.cardTotal} words started</span>
              </div>
              <div className="k-mastery-bar">
                {bands.map(({ k, tone }) =>
                  m[k] > 0
                    ? <i key={k} style={{ width: `${(m[k] / Math.max(1, d.cardTotal)) * 100}%`, background: tone }} />
                    : null,
                )}
              </div>
              <div className="k-mastery-key">
                {bands.map(({ k, label, tone }) => (
                  <span key={k}><b style={{ background: tone }} />{m[k]} {label}</span>
                ))}
              </div>

              {/* Said once, here, because a number that does not move needs a
                  reason or it reads as a fault. */}
              <p className="k-mastery-note">
                A word counts as known once you have got it right three times, on three different
                days. Today&rsquo;s round shows up as &ldquo;learning&rdquo; first.
              </p>
            </div>

            {/* Absent until the first round is logged. An empty fortnight of
                nothing would only tell a new student they are already behind. */}
            {days.length > 0 && (
              <div className="k-hist">
                <p className="k-hist-lab">{copy.practiceHistory}</p>
                <div className="k-hist-bars">
                  {days.map((day) => (
                    <span
                      key={day.day}
                      className="k-hist-day"
                      title={`${day.label}: ${day.cards} card${day.cards === 1 ? '' : 's'}`}
                    >
                      <i
                        className={day.cards === 0 ? 'off' : ''}
                        style={{ height: day.cards === 0 ? 3 : `${Math.max(12, (day.cards / busiest) * 100)}%` }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="k-card k-decks-card" style={{ marginTop: 12 }}>
            {/* The round length and the spacing rules used to be explained here,
                above the piles. Nobody needs the manual before they have picked
                one — the practice screen says how long a round is at the moment
                it matters, which is when you are choosing. */}
            {nothingDue && (
              <p className="k-decks-sub">
                Nothing is due today — every word is resting. Open a pile anyway to keep one sharp.
              </p>
            )}

            <p className="k-prac-ask" style={{ marginTop: 0 }}>{copy.byKind}</p>
            <div className="k-decks">
              {d.decks.map((deck) => (
                <Go key={deck.id} href={`/student/practice?deck=${deck.id}`} className={`k-deck ${deck.tone}`} preview={preview}>
                  <span className="k-deck-n">{deck.due > 0 ? deck.due : '—'}</span>
                  <span className="k-deck-k">{deck.label}</span>
                  <span className="k-deck-s">
                    {deck.due > 0 ? `due of ${deck.total}` : `${deck.total} resting`}
                  </span>
                </Go>
              ))}
            </div>

            {/* The other way people ask for this: not "the verbs" but "the ones
                from last Tuesday". Same cards, different cut. */}
            {d.cardLessons.length > 0 && (
              <>
                <p className="k-prac-ask">{copy.byLesson}</p>
                <div className="k-lesspicks">
                  {d.cardLessons.map((l) => (
                    <Go key={l.id} href={`/student/practice?lesson=${l.id}`} className="k-lesspick" preview={preview}>
                      <span className="k-lesspick-n">{l.number != null ? `#${l.number}` : '—'}</span>
                      <span className="k-lesspick-b">
                        <span className="k-lesspick-t">{l.title}</span>
                        <span className="k-lesspick-m">
                          {l.due > 0 ? `${l.due} due of ${l.total}` : `${l.total} word${l.total === 1 ? '' : 's'} · resting`}
                        </span>
                      </span>
                      <span className="k-lesspick-go" aria-hidden>→</span>
                    </Go>
                  ))}
                </div>
              </>
            )}

            <Go href="/student/practice" className="k-deck-all" preview={preview}>
              {nothingDue ? copy.practiseAnything : copy.practiseDue}
              <span>{firstRound} card{firstRound === 1 ? '' : 's'} →</span>
            </Go>
          </div>
        </>
      )
    }

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
                    <span className="k-btn-pill">{copy.download}</span>
                  ) : (
                    <a className="k-btn-pill" href={`/api/portal/download?kind=file&id=${f.id}`}>{copy.download}</a>
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
