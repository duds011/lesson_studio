import Link from 'next/link'
import { getToken, getBots, getRecaps } from '@/lib/store'
import { isConfigured, listUpcomingLessons, type Lesson } from '@/lib/google'
import { friendlyStatus } from '@/lib/recall'
import AppNav from '@/components/AppNav'
import LessonRow from '@/components/LessonRow'

export const dynamic = 'force-dynamic' // always read fresh token + calendar

// Compare two instants by their calendar day *in a given timezone*.
function dayKey(d: Date, tz: string): string {
  return d.toLocaleDateString('en-CA', { timeZone: tz }) // YYYY-MM-DD
}
function fmtDay(iso: string, tz: string): string {
  const d = new Date(iso)
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  if (dayKey(d, tz) === dayKey(now, tz)) return 'Today'
  if (dayKey(d, tz) === dayKey(tomorrow, tz)) return 'Tomorrow'
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz })
}

type DayGroup = { key: string; label: string; date: string; items: Lesson[] }
// Lessons arrive sorted by start time, so we can group sequentially.
function groupByDay(lessons: Lesson[]): DayGroup[] {
  const groups: DayGroup[] = []
  for (const l of lessons) {
    const key = dayKey(new Date(l.start), l.tz)
    const last = groups[groups.length - 1]
    if (last && last.key === key) {
      last.items.push(l)
    } else {
      groups.push({
        key,
        label: fmtDay(l.start, l.tz),
        date: new Date(l.start).toLocaleDateString(undefined, {
          weekday: 'long', month: 'short', day: 'numeric', timeZone: l.tz,
        }),
        items: [l],
      })
    }
  }
  return groups
}

function ConnectScreen({ configured }: { configured: boolean }) {
  return (
    <main className="wrap page-fade">
      <div className="connect-card">
        <div className="g-orb">
          <svg width="30" height="30" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M44 24c0-1.4-.1-2.7-.4-4H24v8h11.3c-.5 2.6-2 4.8-4.3 6.3v5.2h6.9C41.9 36 44 30.5 44 24z" />
            <path fill="#34A853" d="M24 44c5.8 0 10.6-1.9 14.2-5.2l-6.9-5.2c-1.9 1.3-4.3 2-7.3 2-5.6 0-10.4-3.8-12.1-8.9H4.7v5.4C8.3 39.6 15.6 44 24 44z" />
            <path fill="#FBBC05" d="M11.9 26.7c-.4-1.3-.7-2.7-.7-4.7s.3-3.4.7-4.7v-5.4H4.7C3.6 18.3 3 21.1 3 24s.6 5.7 1.7 8.1l7.2-5.4z" />
            <path fill="#EA4335" d="M24 11.1c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 4.8 29.8 3 24 3 15.6 3 8.3 7.4 4.7 14.9l7.2 5.4C13.6 14.9 18.4 11.1 24 11.1z" />
          </svg>
        </div>
        <h1>Connect your Google Calendar</h1>
        <p>Link your calendar so Lesson Studio can see your upcoming lessons, take bookings, and record each class.</p>
        {!configured && (
          <div className="warn-box">
            Google OAuth isn&rsquo;t configured yet. Add <strong>GOOGLE_CLIENT_ID</strong> and{' '}
            <strong>GOOGLE_CLIENT_SECRET</strong> to the environment, then restart.
          </div>
        )}
        <ul className="scopes">
          <li><strong>Read your calendar</strong> — find lessons and their meeting links</li>
          <li><strong>Record lessons</strong> — send the recording assistant to classes you choose</li>
          <li><strong>Build recaps</strong> — AI lesson summaries for you to review and share</li>
        </ul>
        <a
          className="btn btn-primary"
          href={configured ? '/api/google/auth' : undefined}
          aria-disabled={!configured}
          style={{ width: '100%', justifyContent: 'center', ...(configured ? {} : { opacity: 0.55, pointerEvents: 'none' }) }}
        >
          Continue with Google
        </a>
        <p className="fineprint">You&rsquo;ll be sent to Google&rsquo;s consent screen. Manage this later in Settings.</p>
      </div>
    </main>
  )
}

export default async function Home() {
  const token = await getToken()
  const configured = isConfigured()

  if (!token) {
    return (
      <>
        <AppNav connected={false} />
        <ConnectScreen configured={configured} />
      </>
    )
  }

  let lessons: Lesson[] = []
  let fetchError = ''
  let needsReconnect = false
  try {
    lessons = await listUpcomingLessons()
  } catch (e: any) {
    if (e?.message === 'SCOPE') needsReconnect = true
    else fetchError = e?.message ?? 'Could not load calendar'
  }

  // Existing bot dispatches + recaps, keyed by calendar event id.
  const botRecs = await getBots()
  const recapRecs = await getRecaps()
  const botFor = (eventId: string) => {
    const rec = botRecs[eventId]
    if (!rec) return null
    const f = friendlyStatus(rec.status)
    return { botId: rec.botId, status: rec.status, label: f.label, state: f.state }
  }

  return (
    <>
      <AppNav email={token.email} connected />
      <main className="wrap page-fade">
        <div className="page-head">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h2 className="title">Upcoming lessons</h2>
            <p className="sub">
              From your <strong>{token.calendarName || 'primary'}</strong> calendar · record any lesson and its recap is drafted for review.
            </p>
          </div>
          <Link className="btn btn-ghost btn-sm" href="/settings">Manage connections</Link>
        </div>

        {needsReconnect ? (
          <div className="empty">
            Your Google connection needs updated permissions.{' '}
            <Link href="/settings" style={{ color: 'var(--brand)', fontWeight: 700 }}>Fix it in Settings</Link>
          </div>
        ) : fetchError ? (
          <div className="empty">{fetchError}</div>
        ) : lessons.length === 0 ? (
          <div className="empty">No upcoming lessons on this calendar. Share your booking page to fill it up.</div>
        ) : (
          groupByDay(lessons).map((g) => (
            <div className="day-group" key={g.key}>
              <div className="day-head">
                <span className="day-label">{g.label}</span>
                <span className="day-date">{g.date}</span>
              </div>
              {g.items.map((l) => (
                <LessonRow
                  key={l.id}
                  lesson={{ id: l.id, title: l.title, start: l.start, end: l.end, tz: l.tz, platform: l.platform, meetingUrl: l.meetingUrl }}
                  initialBot={botFor(l.id)}
                  initialRecapStatus={recapRecs[l.id]?.status ?? null}
                />
              ))}
            </div>
          ))
        )}
      </main>
    </>
  )
}
