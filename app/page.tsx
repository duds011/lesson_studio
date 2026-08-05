import Link from 'next/link'
import { getToken, getBots, getRecaps } from '@/lib/store'
import { isConfigured, listUpcomingLessons, listCalendars, type Lesson, type CalendarInfo } from '@/lib/google'
import { friendlyStatus } from '@/lib/recall'
import AppNav from '@/components/AppNav'
import TeacherCalendar, { type CalEvent } from '@/components/TeacherCalendar'
import RecapsToReview from '@/components/RecapsToReview'
import OverviewSync from '@/components/OverviewSync'
import CountUp from '@/components/portal/CountUp'
import RecordingsOverview, { type RecentLesson } from '@/components/RecordingsOverview'
import type { DraftRecap } from '@/components/RecapReview'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { mapEventToStudent } from '@/lib/lesson-link'
import { currentCalendarMode } from '@/lib/calendar-mode.server'
import { resolveTeachingPlatform, TEACHING_PLATFORM_META } from '@/lib/teaching-platform'

export const dynamic = 'force-dynamic' // always read fresh token + calendar

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

/**
 * Draft recaps waiting for the teacher to review, edit and send, each resolved
 * to the lesson number it will get. Recordings are how lessons arrive whether
 * or not there is a calendar, so both overviews below are built on this.
 */
async function loadDraftRecaps(recapRecs: Record<string, any>): Promise<DraftRecap[]> {
  const admin = createAdminClient()
  const draftList = Object.values(recapRecs)
    .filter((r: any) => r.status === 'draft')
    .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

  return Promise.all(draftList.map(async (r: any) => {
    let lessonNumber: number | null = null
    try {
      const linked = await mapEventToStudent(admin, r.eventId, r.attendees ?? [])
      if (linked) {
        const { data: ls } = await admin.from('lessons').select('lesson_number, source_event_id, status').eq('student_id', linked.studentId)
        const existing = (ls || []).find((x: any) => x.source_event_id === r.eventId)
        if (existing?.lesson_number) lessonNumber = existing.lesson_number
        else {
          const maxN = (ls || []).filter((x: any) => x.status === 'published').reduce((m: number, x: any) => Math.max(m, x.lesson_number ?? 0), 0)
          lessonNumber = maxN + 1
        }
      }
    } catch { /* leave null */ }
    return { eventId: r.eventId, studentName: r.studentName, status: r.status, recap: r.recap, lessonDate: r.lessonDate, lessonTitle: r.lessonTitle, createdAt: r.createdAt, lessonNumber }
  }))
}

/** The overview for a teacher who told onboarding they keep no calendar. */
async function RecordingsHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: students }, { data: lessons }] = await Promise.all([
    supabase.from('profiles').select('teaching_platform, meeting_platform').eq('id', user?.id ?? '').single(),
    supabase.from('students').select('id, full_name').eq('teacher_id', user?.id ?? ''),
    supabase.from('lessons')
      .select('id, title, status, lesson_date, lesson_number, student_id')
      .eq('teacher_id', user?.id ?? '')
      .order('lesson_date', { ascending: false })
      .limit(8),
  ])

  const nameById = new Map((students ?? []).map((s: any) => [s.id, s.full_name as string]))
  const recent: RecentLesson[] = (lessons ?? []).map((l: any) => ({
    id: l.id,
    title: l.title,
    studentName: nameById.get(l.student_id) ?? 'Student',
    lessonNumber: l.lesson_number,
    date: l.lesson_date,
    status: l.status,
  }))

  const recapRecs = await getRecaps()
  const draftRecaps = await loadDraftRecaps(recapRecs)
  const platform = resolveTeachingPlatform((profile as any)?.teaching_platform ?? (profile as any)?.meeting_platform)

  return (
    <>
      <AppNav email={user?.email} connected={false} calendar={false} />
      <main className="wrap page-fade">
        <RecordingsOverview
          studentCount={(students ?? []).length}
          draftCount={draftRecaps.length}
          publishedCount={Object.values(recapRecs).filter((r: any) => r.status === 'published').length}
          recent={recent}
          platformLabel={TEACHING_PLATFORM_META[platform].label}
        />
        {draftRecaps.length > 0 && (
          <div style={{ marginTop: 16 }}><RecapsToReview drafts={draftRecaps} /></div>
        )}
      </main>
    </>
  )
}

export default async function Home() {
  const token = await getToken()
  const configured = isConfigured()

  if (!token) {
    // A teacher who said "no calendar" should never meet the connect wall.
    if ((await currentCalendarMode()) === 'none') return <RecordingsHome />
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

  // Calendars the teacher can pick which one holds their lessons.
  let calendars: CalendarInfo[] = []
  if (!needsReconnect) { try { calendars = await listCalendars() } catch { /* ignore */ } }
  const selectedCalId = token.calendarId || 'primary'

  // Existing bot dispatches + recaps, keyed by calendar event id.
  const botRecs = await getBots()
  const recapRecs = await getRecaps()
  const botFor = (eventId: string) => {
    const rec = botRecs[eventId]
    if (!rec) return null
    const f = friendlyStatus(rec.status)
    return { botId: rec.botId, status: rec.status, label: f.label, state: f.state }
  }

  const initialLessons: CalEvent[] = lessons.map((l) => ({
    id: l.id, title: l.title, start: l.start, end: l.end, tz: l.tz, platform: l.platform, meetingUrl: l.meetingUrl,
    attendees: l.attendees, bot: botFor(l.id), recapStatus: recapRecs[l.id]?.status ?? null,
  }))

  const draftRecaps: DraftRecap[] = await loadDraftRecaps(recapRecs)

  return (
    <>
      <AppNav email={token.email} connected />
      <main className="wrap page-fade">
        {/* One slim line. The calendar is what this page is for, so the header
            gets a strip and nothing more. */}
        <header className="k-thead slim">
          {/* First in the DOM so the buttons paint over it, not under. */}
          <div className="k-hero-art" style={{ right: -14, opacity: .5 }} aria-hidden>
            <span className="k-orb" style={{ width: 54, height: 54, right: 4, top: 46 }} />
            <span className="k-tube" style={{ width: 40, height: 40, right: 54, top: 68, borderWidth: 10 }} />
            <span className="k-ring" style={{ width: 26, height: 26, right: 104, top: 54, borderWidth: 7 }} />
          </div>

          <div className="k-thead-title">
            <span className="k-phead-eyebrow">Overview</span>
            <h1>Your teaching calendar</h1>
          </div>
          <div className="k-thead-actions">
            <Link className="btn btn-ghost" href="/settings">Manage connections</Link>
            <Link className="btn btn-primary" href="/book" target="_blank">Open booking page ↗</Link>
          </div>
        </header>

        <OverviewSync />

        <div className="k-overview">
          {/* Calendar first, at the top, before anything else. */}
          <div className="k-overview-main">
            {needsReconnect ? (
              <div className="empty">
                Your Google connection needs updated permissions.{' '}
                <Link href="/settings" style={{ color: 'var(--brand)', fontWeight: 700 }}>Fix it in Settings</Link>
              </div>
            ) : fetchError ? (
              <div className="empty">{fetchError}</div>
            ) : (
              <TeacherCalendar initialLessons={initialLessons} />
            )}

            {draftRecaps.length > 0 && <RecapsToReview drafts={draftRecaps} />}
          </div>

          <aside className="k-overview-rail" aria-label="Lesson summary">
            <div className="k-tstats">
              <div className="k-stat yellow">
                <div className="k-stat-head"><span>Upcoming lessons</span></div>
                <div className="k-stat-val"><b><CountUp value={lessons.length} /></b></div>
                <p className="k-stat-sub">on {token.calendarName || 'your calendar'}</p>
              </div>
              <div className="k-stat blue">
                <div className="k-stat-head"><span>Drafts to review</span></div>
                <div className="k-stat-val"><b><CountUp value={Object.values(recapRecs).filter((r) => r.status === 'draft').length} /></b></div>
                <p className="k-stat-sub">recaps waiting on you</p>
              </div>
              <div className="k-stat purple">
                <div className="k-stat-head"><span>Published recaps</span></div>
                <div className="k-stat-val"><b><CountUp value={Object.values(recapRecs).filter((r) => r.status === 'published').length} /></b></div>
                <p className="k-stat-sub">sent to students</p>
              </div>
            </div>

            {calendars.length > 1 && (
              <div className="analytics-card k-rail-card">
                <p className="analytics-label">📅 Lesson calendar</p>
                <div className="cal-picker">
                  {calendars.map((c) => {
                    const sel = c.id === selectedCalId || (c.primary && selectedCalId === 'primary')
                    return (
                      <form key={c.id} action="/api/google/select-calendar" method="post" style={{ display: 'inline' }}>
                        <input type="hidden" name="calendarId" value={c.id} />
                        <input type="hidden" name="calendarName" value={c.name} />
                        <button type="submit" className={`cal-opt ${sel ? 'sel' : ''}`}>{sel ? '✓ ' : ''}{c.name}{c.primary ? ' (primary)' : ''}</button>
                      </form>
                    )
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}
