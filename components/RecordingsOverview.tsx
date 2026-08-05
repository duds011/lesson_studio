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
        <div className="k-hero-art" style={{ right: -14, opacity: .5 }} aria-hidden>
          <span className="k-orb" style={{ width: 54, height: 54, right: 4, top: 46 }} />
          <span className="k-tube" style={{ width: 40, height: 40, right: 54, top: 68, borderWidth: 10 }} />
          <span className="k-ring" style={{ width: 26, height: 26, right: 104, top: 54, borderWidth: 7 }} />
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
              <span className="k-sec-icon" aria-hidden>🎙️</span>
              <div>
                <h3>How lessons reach you</h3>
                <p className="desc">
                  You teach in {platformLabel}, so nothing is scheduled here. A lesson enters Lesson Studio
                  the moment its recording does.
                </p>
              </div>
            </div>

            {[
              ['Record the lesson', 'Use the browser recorder, or upload the file your platform gives you.'],
              ['We build the recap', 'Summary, vocabulary, corrections and practice, drafted from the transcript.'],
              ['You review and publish', 'Edit anything, then send it — the student sees it in their portal.'],
            ].map(([title, note], i) => (
              <div key={title} className="k-onb-ok" style={i > 0 ? { marginTop: 10 } : undefined}>
                <span aria-hidden>{i + 1}</span>
                <div><strong>{title}</strong><small>{note}</small></div>
              </div>
            ))}
          </section>

          <section className="k-sec">
            <div className="k-sec-head">
              <span className="k-sec-icon b" aria-hidden>📄</span>
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
              <div>
                {recent.map((l) => (
                  <div key={l.id} className="lesson-card">
                    <span className="lc-num">{l.lessonNumber ? `#${l.lessonNumber}` : '—'}</span>
                    <div>
                      <div className="lc-title">{l.title || 'Untitled lesson'}</div>
                      <div className="lc-meta">{l.studentName} · {fmtDate(l.date)}</div>
                    </div>
                    <span className={`pill ${l.status === 'published' ? 'green' : 'amber'}`}>
                      {l.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="k-overview-rail" aria-label="Lesson summary">
          <div className="k-tstats">
            <div className="k-stat yellow">
              <div className="k-stat-head"><span>Students</span></div>
              <div className="k-stat-val"><b><CountUp value={studentCount} /></b></div>
              <p className="k-stat-sub">with a portal of their own</p>
            </div>
            <div className="k-stat blue">
              <div className="k-stat-head"><span>Drafts to review</span></div>
              <div className="k-stat-val"><b><CountUp value={draftCount} /></b></div>
              <p className="k-stat-sub">recaps waiting on you</p>
            </div>
            <div className="k-stat purple">
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
