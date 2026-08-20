import Link from 'next/link'
import { getToken, getRecaps } from '@/lib/store'
import { isConfigured, listUpcomingLessons, listCalendars, type Lesson, type CalendarInfo } from '@/lib/google'
import { calendarFailure, CALENDAR_FAILURE_TEXT, isFixable, type CalendarFailure } from '@/lib/calendar-error'
import AppNav from '@/components/AppNav'
import TeacherCalendar, { type CalEvent } from '@/components/TeacherCalendar'
import RecapsToReview from '@/components/RecapsToReview'
import CountUp from '@/components/portal/CountUp'
import RecordingsOverview, { type RecentLesson } from '@/components/RecordingsOverview'
import type { DraftRecap } from '@/components/RecapReview'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { mapEventToStudent } from '@/lib/lesson-link'
import { currentCalendarMode } from '@/lib/calendar-mode.server'
import { listPendingRecordings } from '@/app/actions/recordings'
import PendingRecordings from '@/components/portal/PendingRecordings'
import RecorderMissing from '@/components/portal/RecorderMissing'
import { resolveTeachingPlatform, TEACHING_PLATFORM_META } from '@/lib/teaching-platform'
import { getRecapUsage } from '@/lib/recap-quota'

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
          <li><strong>Record lessons</strong> — capture classes with the Lesson Studio extension</li>
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
/**
 * The calendar dot answers one question: does this event have a recap yet?
 * 'processing' does not yet and 'failed' does not at all, so both read as none
 * here. They are surfaced properly in the review queue, which is where a
 * teacher can actually act on them.
 */
const calendarRecapStatus = (s?: string | null): 'draft' | 'published' | null =>
  s === 'draft' || s === 'published' ? s : null

async function loadDraftRecaps(recapRecs: Record<string, any>): Promise<DraftRecap[]> {
  const admin = createAdminClient()
  // Everything not yet published belongs in the queue: a recap still building
  // and one that failed are both lessons the teacher is owed an answer about.
  const draftList = Object.values(recapRecs)
    .filter((r: any) => r.status === 'draft' || r.status === 'processing' || r.status === 'failed')
    .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

  /**
   * The number shown here is a forecast of the number the database will assign
   * once EVERYTHING in the queue is sent — assignment is chronological by
   * lesson DATE, not by which recap gets reviewed first. That means the whole
   * queue has to be numbered together: an Aug 16 recording slots in ahead of
   * an already-published Aug 19 lesson and bumps it to 4, even though that
   * Aug 19 lesson holds number 3 today. Showing today's number instead put
   * two "Lesson 3" cards side by side.
   */
  const linkedDrafts = await Promise.all(draftList.map(async (r: any) => {
    try {
      return { r, linked: await mapEventToStudent(admin, r.eventId, r.attendees ?? []) }
    } catch {
      return { r, linked: null }
    }
  }))

  const draftDate = (r: any) =>
    (r.lessonDate ? String(r.lessonDate).slice(0, 10) : '') ||
    (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : '9999-12-31')

  const studentIds = Array.from(new Set(linkedDrafts.flatMap((x) => (x.linked ? [x.linked.studentId] : []))))
  const lessonsByStudent = new Map<string, any[]>()
  await Promise.all(studentIds.map(async (sid) => {
    const { data } = await admin.from('lessons').select('lesson_date, source_event_id, status, created_at').eq('student_id', sid)
    lessonsByStudent.set(sid, data ?? [])
  }))

  // Per student: published lessons and queued drafts merged into one timeline,
  // sorted the way the database will sort them (date, then creation time). A
  // draft whose recording was already published once represents its lesson row
  // rather than sitting next to it, so republishing doesn't double-count.
  const forecastByEvent = new Map<string, number>()
  for (const sid of studentIds) {
    const ls = lessonsByStudent.get(sid) ?? []
    const queued = linkedDrafts.filter((x) => x.linked?.studentId === sid)
    const queuedEvents = new Set(queued.map((x) => x.r.eventId))

    type Slot = { eventId: string | null; date: string; tie: number }
    const slots: Slot[] = ls
      .filter((x: any) => x.status === 'published' && !queuedEvents.has(x.source_event_id))
      .map((x: any) => ({ eventId: null, date: String(x.lesson_date ?? ''), tie: Date.parse(x.created_at) || 0 }))
    for (const { r } of queued) {
      const row = ls.find((x: any) => x.source_event_id === r.eventId)
      slots.push({
        eventId: r.eventId,
        date: row?.lesson_date ? String(row.lesson_date) : draftDate(r),
        // An upsert keeps the row's original created_at, so the forecast must too.
        tie: row?.created_at ? Date.parse(row.created_at) || 0 : (r.createdAt ?? Number.MAX_SAFE_INTEGER),
      })
    }
    slots.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.tie - b.tie))
    slots.forEach((s, i) => { if (s.eventId) forecastByEvent.set(s.eventId, i + 1) })
  }

  return linkedDrafts.map(({ r }) => ({
    eventId: r.eventId,
    studentName: r.studentName,
    status: r.status,
    recap: r.recap,
    error: r.error,
    lessonDate: r.lessonDate,
    lessonTitle: r.lessonTitle,
    createdAt: r.createdAt,
    lessonNumber: forecastByEvent.get(r.eventId) ?? null,
  }))
}

/**
 * How many recaps this teacher has actually sent.
 *
 * Counted from the lessons table, not from the recap docs in the key-value
 * store. Those two had drifted: a draft lives in KV and only becomes a lesson
 * row on publish, but a lesson row outlives its KV doc — deleting a reviewed
 * draft, or any lesson published before that store existed, leaves a lesson a
 * student can read and no doc to count. The tile said 3 while the list under
 * it showed 6. The row is what the student sees, so the row is the truth.
 */
async function hasRecorder(teacherId: string): Promise<boolean> {
  const admin = createAdminClient()

  // Written the first time the extension signs in with THIS account.
  const { data: token } = await admin
    .from('teacher_ext_tokens').select('teacher_id').eq('teacher_id', teacherId).maybeSingle()
  if (token) return true

  /**
   * Or: anything ever arrived. A teacher with lessons on the board plainly has
   * a working recorder, whatever the token table says — they may have signed
   * the extension in under another of their accounts, or predate the token
   * entirely. Telling someone with six published recaps that nothing can reach
   * this page is both wrong and impossible to dismiss.
   */
  const { count } = await admin
    .from('lessons').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId)
  return (count ?? 0) > 0
}

async function publishedLessonCount(supabase: any, teacherId: string): Promise<number> {
  const { count } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId)
    .eq('status', 'published')
  return count ?? 0
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
    studentId: l.student_id,
    studentName: nameById.get(l.student_id) ?? 'Student',
    lessonNumber: l.lesson_number,
    date: l.lesson_date,
    status: l.status,
  }))

  const recapRecs = await getRecaps()
  const draftRecaps = await loadDraftRecaps(recapRecs)
  const platform = resolveTeachingPlatform((profile as any)?.teaching_platform ?? (profile as any)?.meeting_platform)
  const pending = await listPendingRecordings()
  const studentOptions = (students ?? []).map((s: any) => ({ id: s.id, name: s.full_name }))
  const publishedCount = await publishedLessonCount(supabase, user?.id ?? '')
  const recorderReady = await hasRecorder(user?.id ?? '')
  const usage = user ? await getRecapUsage(user.id) : null

  return (
    <>
      <AppNav email={user?.email} connected={false} calendar={false} />
      <main className="wrap page-fade">
        {!recorderReady && <RecorderMissing />}
        <PendingRecordings recordings={pending} students={studentOptions} />
        <RecordingsOverview
          studentCount={(students ?? []).length}
          draftCount={draftRecaps.length}
          publishedCount={publishedCount}
          usage={usage}
          recent={recent.filter((l) => l.status === 'published')}
          platformLabel={TEACHING_PLATFORM_META[platform].label}
          review={<RecapsToReview drafts={draftRecaps} students={studentOptions} />}
        />
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
  let failure: CalendarFailure | null = null
  try {
    lessons = await listUpcomingLessons()
  } catch (e) {
    failure = calendarFailure(e)
  }

  // Calendars the teacher can pick which one holds their lessons.
  let calendars: CalendarInfo[] = []
  if (!failure) { try { calendars = await listCalendars() } catch { /* ignore */ } }
  const selectedCalId = token.calendarId || 'primary'

  // Existing recaps, keyed by calendar event id.
  const recapRecs = await getRecaps()

  const initialLessons: CalEvent[] = lessons.map((l) => ({
    id: l.id, title: l.title, start: l.start, end: l.end, tz: l.tz, platform: l.platform, meetingUrl: l.meetingUrl,
    attendees: l.attendees, recapStatus: calendarRecapStatus(recapRecs[l.id]?.status),
  }))

  const draftRecaps: DraftRecap[] = await loadDraftRecaps(recapRecs)

  // Waiting recordings outrank the calendar: the lesson already happened, and
  // nothing else on this page is blocked on the teacher the way this is.
  const pending = await listPendingRecordings()
  const supabaseForStudents = await createClient()
  const { data: { user: me } } = await supabaseForStudents.auth.getUser()
  const { data: myStudents } = await supabaseForStudents
    .from('students').select('id, full_name').eq('teacher_id', me?.id ?? '')
  const studentOptions = (myStudents ?? []).map((s: any) => ({ id: s.id, name: s.full_name }))
  const publishedCount = await publishedLessonCount(supabaseForStudents, me?.id ?? '')
  const recorderReady = await hasRecorder(me?.id ?? '')
  const usage = me ? await getRecapUsage(me.id) : null

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
          {/* No booking-page link. These teachers get their students from
              Preply, italki or their own calendar — none of them is going to
              send a booking link — so it was a door nobody opened. /book still
              exists for anyone who wants the URL. */}
          <div className="k-thead-actions">
            <Link className="btn btn-ghost" href="/settings">Manage connections</Link>
          </div>
        </header>

        {!recorderReady && <RecorderMissing />}
        <PendingRecordings recordings={pending} students={studentOptions} />

        <div className="k-overview">
          {/* Calendar first, at the top, before anything else. */}
          <div className="k-overview-main">
            {failure ? (
              <div className="empty">
                {CALENDAR_FAILURE_TEXT[failure]}{' '}
                {isFixable(failure) && (
                  <Link href="/settings" style={{ color: 'var(--brand)', fontWeight: 700 }}>Fix it in Settings</Link>
                )}
              </div>
            ) : (
              <TeacherCalendar initialLessons={initialLessons} />
            )}

            {draftRecaps.length > 0 && <RecapsToReview drafts={draftRecaps} students={studentOptions} />}
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
                <div className="k-stat-val"><b><CountUp value={publishedCount} /></b></div>
                <p className="k-stat-sub">sent to students</p>
              </div>
              {usage && (
                <div className="k-stat green">
                  <div className="k-stat-head"><span>Recaps left</span></div>
                  <div className="k-stat-val"><b><CountUp value={usage.left} /></b></div>
                  <p className="k-stat-sub">{usage.used} used of {usage.limit} this month</p>
                </div>
              )}
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
