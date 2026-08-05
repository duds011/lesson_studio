import Link from 'next/link'
import CountUp from '@/components/portal/CountUp'

export type RecentLesson = {
  id: string
  title: string | null
  studentName: string
  lessonNumber: number | null
  date: string | null
  status: string
}

type Props = {
  studentCount: number
  draftCount: number
  publishedCount: number
  recent: RecentLesson[]
  /** Where they told us they teach — quoted back so the page feels theirs. */
  platformLabel: string
}

const fmtDate = (d: string | null) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'

/**
 * The overview for a teacher who told us their lessons don't live on a
 * calendar. The calendar-backed page opens on the week ahead; this one opens on
 * what actually moves for them — recordings turning into recaps — and never
 * mentions a connection they've already declined.
 */
export default function RecordingsOverview({
  studentCount, draftCount, publishedCount, recent, platformLabel,
}: Props) {
  return (
    <>
      <header className="k-thead slim">
        <div className="k-hero-art" aria-hidden>
          <span className="k-line-arc" style={{ width: 90, height: 90, right: 10, top: 6 }} />
          <span className="k-line-ring" style={{ width: 44, height: 44, right: 82, top: 40 }} />
          <span className="k-line-bar" style={{ width: 120, right: 30, top: 84 }} />
        </div>
        <div className="k-thead-title">
          <span className="k-phead-eyebrow">Overview</span>
          <h1>Lessons &amp; recaps</h1>
        </div>
        <div className="k-thead-actions">
          <Link className="btn btn-ghost" href="/settings">Settings</Link>
          <Link className="btn btn-primary" href="/teacher/dashboard">Your students</Link>
        </div>
      </header>

      <div className="k-overview">
        <div className="k-overview-main">
          <section className="k-sec">
            <div className="k-sec-head">
              <span className="k-sec-icon" aria-hidden>◎</span>
              <div>
                <h3>How lessons reach you</h3>
                <p className="desc">
                  You teach in {platformLabel}, so nothing is scheduled here. A lesson enters Lesson Studio
                  the moment its recording does.
                </p>
              </div>
            </div>

            <ol className="k-steps">
              <li>
                <b>Record the lesson</b>
                <span>Use the browser recorder, or upload the file your platform gives you.</span>
              </li>
              <li>
                <b>We build the recap</b>
                <span>Summary, vocabulary, corrections and practice, drafted from the transcript.</span>
              </li>
              <li>
                <b>You review and publish</b>
                <span>Edit anything, then send it — the student sees it in their portal.</span>
              </li>
            </ol>
          </section>

          <section className="k-sec">
            <div className="k-sec-head">
              <span className="k-sec-icon b" aria-hidden>▤</span>
              <div>
                <h3>Latest lessons</h3>
                <p className="desc">Everything published or drafted for your students, newest first.</p>
              </div>
            </div>

            {recent.length === 0 ? (
              <div className="empty">
                <strong>No lessons yet</strong><br />
                Record your first lesson and it will appear here as a draft recap.
              </div>
            ) : (
              <div className="k-list">
                {recent.map((l) => (
                  <div key={l.id} className="k-list-row">
                    <span className="k-list-num">{l.lessonNumber ? `#${l.lessonNumber}` : '—'}</span>
                    <div className="k-list-copy">
                      <strong>{l.title || 'Untitled lesson'}</strong>
                      <small>{l.studentName} · {fmtDate(l.date)}</small>
                    </div>
                    <span className={`pill ${l.status === 'published' ? 'green' : 'amber'}`}>
                      {l.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="k-overview-rail" aria-label="Lesson summary">
          <div className="k-tstats">
            <div className="k-stat one">
              <div className="k-stat-head"><span>Students</span></div>
              <div className="k-stat-val"><b><CountUp value={studentCount} /></b></div>
              <p className="k-stat-sub">with a portal of their own</p>
            </div>
            <div className="k-stat two">
              <div className="k-stat-head"><span>Drafts to review</span></div>
              <div className="k-stat-val"><b><CountUp value={draftCount} /></b></div>
              <p className="k-stat-sub">recaps waiting on you</p>
            </div>
            <div className="k-stat three">
              <div className="k-stat-head"><span>Published recaps</span></div>
              <div className="k-stat-val"><b><CountUp value={publishedCount} /></b></div>
              <p className="k-stat-sub">sent to students</p>
            </div>
          </div>

          {/* The door back, offered once and quietly — not a wall. */}
          <div className="k-sec k-rail-card">
            <p className="analytics-label">Changed your mind?</p>
            <p className="desc" style={{ marginBottom: 10 }}>
              Connect Google Calendar and you get a booking page, free-slot scheduling and automatic recording.
            </p>
            <Link className="btn btn-ghost" href="/settings#connections">Connect a calendar</Link>
          </div>
        </aside>
      </div>
    </>
  )
}
