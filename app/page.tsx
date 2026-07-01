import { getToken, getBots, getRecaps } from '@/lib/store'
import { isConfigured, listUpcomingLessons, listCalendars, type Lesson, type CalendarInfo } from '@/lib/google'
import { friendlyStatus } from '@/lib/recall'
import { getSettings } from '@/lib/settings'
import LessonRow from '@/components/LessonRow'
import ZoomStatus from '@/components/ZoomStatus'

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
function fmtTime(iso: string, tz: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: tz })
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
function fmtDur(start: string, end: string): string {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  return mins > 0 ? `${mins} min` : ''
}

function Nav({ email }: { email?: string }) {
  return (
    <nav>
      <div className="nav-in">
        <a className="logo" href="/">
          <span className="mark">の</span>
          <span><span className="brand-word">GENOA</span> · Lesson Studio</span>
        </a>
        <div className="nav-right">
          <span className={`cal-chip ${email ? 'on' : ''}`}>
            <span className="dot" />
            {email ? email : 'Calendar not connected'}
          </span>
          <div className="avatar" title="Noa">N</div>
        </div>
      </div>
    </nav>
  )
}

function ConnectScreen({ configured }: { configured: boolean }) {
  return (
    <main className="wrap">
      <div className="connect-card">
        <div className="g-orb">
          <svg width="34" height="34" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44 24c0-1.4-.1-2.7-.4-4H24v8h11.3c-.5 2.6-2 4.8-4.3 6.3v5.2h6.9C41.9 36 44 30.5 44 24z" />
            <path fill="#34A853" d="M24 44c5.8 0 10.6-1.9 14.2-5.2l-6.9-5.2c-1.9 1.3-4.3 2-7.3 2-5.6 0-10.4-3.8-12.1-8.9H4.7v5.4C8.3 39.6 15.6 44 24 44z" />
            <path fill="#FBBC05" d="M11.9 26.7c-.4-1.3-.7-2.7-.7-4.7s.3-3.4.7-4.7v-5.4H4.7C3.6 18.3 3 21.1 3 24s.6 5.7 1.7 8.1l7.2-5.4z" />
            <path fill="#EA4335" d="M24 11.1c3.2 0 6 1.1 8.2 3.2l6.1-6.1C34.6 4.8 29.8 3 24 3 15.6 3 8.3 7.4 4.7 14.9l7.2 5.4C13.6 14.9 18.4 11.1 24 11.1z" />
          </svg>
        </div>
        <h1>Connect your Google Calendar</h1>
        <p>Noa, link your calendar so Lesson Studio can see your upcoming lessons and send the recording assistant into each one.</p>
        {!configured && (
          <div className="warn-box">
            ⚠️ Google OAuth isn’t configured yet. Add <strong>GOOGLE_CLIENT_ID</strong> and{' '}
            <strong>GOOGLE_CLIENT_SECRET</strong> to <code>.env</code>, then restart the dev server.
          </div>
        )}
        <ul className="scopes">
          <li>📅 <strong>Read your calendar events</strong> — to find lessons and their Zoom / Meet links</li>
          <li>🤖 <strong>Send the Noa bot</strong> to lessons you choose to record</li>
          <li>📝 <strong>Build a recap</strong> from the recording for your review</li>
        </ul>
        <a
          className="btn btn-primary"
          href={configured ? '/api/google/auth' : undefined}
          aria-disabled={!configured}
          style={{ width: '100%', justifyContent: 'center', ...(configured ? {} : { opacity: 0.55, pointerEvents: 'none' }) }}
        >
          Continue with Google
        </a>
        <p className="fineprint">You’ll be sent to Google’s consent screen. We only request read access to your calendar.</p>
      </div>
    </main>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: { connected?: string }
}) {
  const token = await getToken()
  const configured = isConfigured()

  if (!token) {
    return (
      <>
        <Nav />
        <ConnectScreen configured={configured} />
      </>
    )
  }

  // Load the teacher's calendars so she can pick which one holds her lessons.
  let calendars: CalendarInfo[] = []
  let needsReconnect = false
  try {
    calendars = await listCalendars()
  } catch (e: any) {
    if (e?.message === 'SCOPE') needsReconnect = true
  }

  const selectedId = token.calendarId || 'primary'
  const settings = await getSettings()

  let lessons: Lesson[] = []
  let fetchError = ''
  if (!needsReconnect) {
    try {
      lessons = await listUpcomingLessons()
    } catch (e: any) {
      fetchError = e?.message ?? 'Could not load calendar'
    }
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
      <Nav email={token.email} />
      <main className="wrap">
        <div className="flow-note">
          ✅ Live data from Google Calendar. Next milestones: send the Recall bot per lesson → AI recap → review.
        </div>

        <div className="page-head">
          <div>
            <span className="eyebrow"><span className="dot" style={{ width: '.4rem', height: '.4rem', background: 'var(--brand)' }} />Lesson Studio</span>
            <h2 className="title">おはよう, Noa 👋</h2>
            <p className="sub">Lessons pulled live from your <strong>{token.calendarName || 'primary'}</strong> calendar.</p>
          </div>
          <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
            <a className="btn btn-ghost btn-sm" href="/students">👥 Students</a>
            <a className="btn btn-ghost btn-sm" href="/book">🔗 Student booking page</a>
            <form action="/api/google/disconnect" method="post">
              <button className="btn btn-danger-ghost btn-sm" type="submit">Disconnect calendar</button>
            </form>
          </div>
        </div>

        {needsReconnect ? (
          <div className="empty" style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
            🔐 To read your other calendars (like “Japnese lesson”), reconnect to grant the wider permission.
            <div style={{ marginTop: '.8rem' }}>
              <a className="btn btn-primary btn-sm" href="/api/google/auth">Reconnect Google Calendar</a>
            </div>
          </div>
        ) : (
          <>
            <div className="section-label">🗂 Which calendar has your lessons?</div>
            <div className="cal-picker">
              {calendars.map((c) => {
                const sel = c.id === selectedId || (c.primary && selectedId === 'primary')
                return (
                  <form key={c.id} action="/api/google/select-calendar" method="post" style={{ display: 'inline' }}>
                    <input type="hidden" name="calendarId" value={c.id} />
                    <input type="hidden" name="calendarName" value={c.name} />
                    <button type="submit" className={`cal-opt ${sel ? 'sel' : ''}`}>
                      {sel ? '✓ ' : ''}{c.name}{c.primary ? ' (primary)' : ''}
                    </button>
                  </form>
                )
              })}
            </div>

            <div className="section-label">🎥 Meeting platform for new bookings</div>
            <div className="cal-picker" style={{ alignItems: 'center' }}>
              <form action="/api/settings" method="post" style={{ display: 'inline' }}>
                <input type="hidden" name="platform" value="google_meet" />
                <button type="submit" className={`cal-opt ${settings.platform === 'google_meet' ? 'sel' : ''}`}>
                  {settings.platform === 'google_meet' ? '✓ ' : ''}Google Meet
                </button>
              </form>
              <form action="/api/settings" method="post" style={{ display: 'inline' }}>
                <input type="hidden" name="platform" value="zoom" />
                <button type="submit" className={`cal-opt ${settings.platform === 'zoom' ? 'sel' : ''}`}>
                  {settings.platform === 'zoom' ? '✓ ' : ''}Zoom
                </button>
              </form>
              {settings.platform === 'zoom' && <ZoomStatus />}
            </div>

            <div className="section-label">📅 Upcoming lessons</div>
            {fetchError ? (
              <div className="empty">⚠️ {fetchError}</div>
            ) : lessons.length === 0 ? (
              <div className="empty">No upcoming lessons on this calendar. Pick another calendar above, or add a lesson.</div>
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
          </>
        )}
      </main>
    </>
  )
}
