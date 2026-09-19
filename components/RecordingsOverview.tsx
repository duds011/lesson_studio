import Link from 'next/link'
import type { Messages } from '@/lib/i18n'
import CountUp from '@/components/portal/CountUp'
import HowLessonsReachYou from '@/components/HowLessonsReachYou'
import type { RecapUsage } from '@/lib/recap-quota'
import { TRIAL_RECAPS } from '@/lib/plans'

export type RecentLesson = {
  id: string
  title: string | null
  studentId: string
  studentName: string
  lessonNumber: number | null
  date: string | null
  status: string
}

type Props = {
  studentCount: number
  draftCount: number
  publishedCount: number
  /** This month's recap allowance — every teacher sees where they stand. */
  usage?: RecapUsage | null
  recent: RecentLesson[]
  /** Where they told us they teach — quoted back so the page feels theirs. */
  platformLabel: string
  /** The review queue, rendered FIRST in the main column — it is the page's
   *  whole point. It used to float below the grid as a separate afterthought,
   *  while the drafts it held were invisible in the lessons list (no lesson
   *  row exists until publish): the same work shown twice, coherent nowhere. */
  review?: React.ReactNode
}

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'

/**
 * The overview for a teacher who told us their lessons don't live on a
 * calendar. The calendar-backed page opens on the week ahead; this one opens on
 * what actually moves for them — recordings turning into recaps — and never
 * mentions a connection they've already declined.
 */
/**
 * A server component, so the copy arrives as a prop. It renders inside the
 * provider but cannot read it — that hook only exists on the client.
 */
export default function RecordingsOverview({
  studentCount, draftCount, publishedCount, usage, recent, platformLabel, review, t,
}: Props & { t: Messages }) {
  return (
    <>
      <header className="k-thead slim">
        <div className="k-hero-art" style={{ right: -14, opacity: .5 }} aria-hidden>
          <span className="k-orb" style={{ width: 54, height: 54, right: 4, top: 46 }} />
          <span className="k-tube" style={{ width: 40, height: 40, right: 54, top: 68, borderWidth: 10 }} />
          <span className="k-ring" style={{ width: 26, height: 26, right: 104, top: 54, borderWidth: 7 }} />
        </div>
        <div className="k-thead-title">
          <span className="k-phead-eyebrow">{t.recordings.eyebrow}</span>
          <h1>{t.recordings.title}</h1>
        </div>
        <div className="k-thead-actions">
          <Link className="btn btn-ghost" href="/settings">{t.recordings.settings}</Link>
          <Link className="btn btn-primary" href="/teacher/dashboard">{t.recordings.yourStudents}</Link>
        </div>
      </header>

      <div className="k-overview">
        <div className="k-overview-main">
          {/* Closes, and stays closed — see HowLessonsReachYou. */}
          <HowLessonsReachYou platformLabel={platformLabel} />

          {review}

          <section className="k-sec">
            <div className="k-sec-head">
              <span className="k-sec-icon b" aria-hidden>📄</span>
              <div>
                <h3>{t.recordings.publishedTitle}</h3>
                <p className="desc">{t.recordings.publishedDesc}</p>
              </div>
            </div>

            {recent.length === 0 ? (
              <div className="empty">
                <strong>{t.recordings.nothingPublished}</strong><br />
                Record a lesson, review the recap it becomes, and send it — it lands here.
              </div>
            ) : (
              <div>
                {recent.map((l) => (
                  <Link key={l.id} href={`/teacher/students/${l.studentId}/lessons/${l.id}`} className="lesson-card">
                    <span className="lc-num">{l.lessonNumber ? `#${l.lessonNumber}` : '—'}</span>
                    <div>
                      <div className="lc-title">{l.title || t.recordings.untitled}</div>
                      <div className="lc-meta">{l.studentName} · {fmtDate(l.date)}</div>
                    </div>
                    <span className={`pill ${l.status === 'published' ? 'green' : 'amber'}`}>
                      {l.status === 'published' ? t.recordings.published : t.recordings.draft}
                    </span>
                    <span className="lc-arrow">→</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="k-overview-rail" aria-label={t.recordings.summaryAria}>
          <div className="k-tstats">
            <div className="k-stat yellow">
              <div className="k-stat-head"><span>{t.recordings.students}</span></div>
              <div className="k-stat-val"><b><CountUp value={studentCount} /></b></div>
              <p className="k-stat-sub">with a portal of their own</p>
            </div>
            <div className="k-stat blue">
              <div className="k-stat-head"><span>{t.overview.drafts}</span></div>
              <div className="k-stat-val"><b><CountUp value={draftCount} /></b></div>
              <p className="k-stat-sub">recaps waiting on you</p>
            </div>
            <div className="k-stat purple">
              <div className="k-stat-head"><span>{t.overview.published}</span></div>
              <div className="k-stat-val"><b><CountUp value={publishedCount} /></b></div>
              <p className="k-stat-sub">sent to students</p>
            </div>
            {usage && (
              <Link href="/teacher/recaps" className="k-stat green" aria-label={t.overview.writeUpsAria}>
                <div className="k-stat-head"><span>{t.overview.writeUpsLeft}</span></div>
                <div className="k-stat-val"><b><CountUp value={usage.left} /></b></div>
                {/* The bar measured progress through a monthly allowance.
                    There is no month and no denominator now — a balance that
                    only falls has nothing to fill. */}
                <p className="k-stat-sub">
                  {usage.trial
                    ? `${usage.used} used of your ${TRIAL_RECAPS} free`
                    : `${usage.used} built · they don't expire`}
                </p>
              </Link>
            )}
          </div>

          {/* The door back, offered once and quietly — not a wall. */}
          <div className="k-sec k-rail-card">
            <p className="analytics-label">{t.recordings.changedMind}</p>
            <p className="desc" style={{ marginBottom: 10 }}>
              Connect Google Calendar and you get a booking page, free-slot scheduling and automatic recording.
            </p>
            <Link className="btn btn-ghost" href="/settings#connections">{t.recordings.connectCalendar}</Link>
          </div>
        </aside>
      </div>
    </>
  )
}
