import { getToken } from '@/lib/store'
import { listCalendars, type CalendarInfo } from '@/lib/google'
import { getSettings } from '@/lib/settings'
import { getBookingConfig } from '@/lib/booking'
import { zoomConnection, isZoomConfigured } from '@/lib/zoom'
import { createClient } from '@/lib/supabase/server'
import { CALENDAR_MODES, CALENDAR_MODE_META, resolveCalendarMode } from '@/lib/calendar-mode'
import { chooseCalendarMode } from '@/app/actions/calendar'
import AppNav from '@/components/AppNav'
import AvailabilityEditor from '@/components/AvailabilityEditor'
import ConnectorsGallery from '@/components/ConnectorsGallery'
import SettingsTabs, { SettingsPanel } from '@/components/SettingsTabs'
import ExtTokenPanel from '@/components/ExtTokenPanel'
import ReplayTourButton from '@/components/ReplayTourButton'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const token = await getToken()
  const settings = await getSettings()
  const bookingConfig = await getBookingConfig()

  let calendars: CalendarInfo[] = []
  let needsReconnect = false
  if (token) {
    try {
      calendars = await listCalendars()
    } catch (e: any) {
      if (e?.message === 'SCOPE') needsReconnect = true
    }
  }
  const selectedId = token?.calendarId || 'primary'

  // Connector statuses for the gallery.
  const zoom = { configured: isZoomConfigured(), ...(await zoomConnection()) }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('stripe_account_id, stripe_charges_enabled, calendar_mode').eq('id', user.id).single()
    : { data: null }
  const calendarMode = resolveCalendarMode((profile as any)?.calendar_mode)
  // The teacher's own recorder token, read with their own client so RLS
  // confirms it is theirs rather than the page taking the id on trust.
  const { data: extToken } = user
    ? await supabase.from('teacher_ext_tokens').select('token, last_used_at').eq('teacher_id', user.id).maybeSingle()
    : { data: null }
  const stripe = {
    connected: Boolean((profile as any)?.stripe_account_id),
    chargesEnabled: Boolean((profile as any)?.stripe_charges_enabled),
  }

  return (
    <>
      <AppNav email={token?.email} connected={Boolean(token)} calendar={calendarMode !== 'none'} />
      <main className="wrap settings-wrap page-fade">
        <header className="k-thead slim">
          <div className="k-thead-title">
            <span className="k-phead-eyebrow">Workspace</span>
            <h1>Settings</h1>
          </div>
          <div className="k-hero-art" style={{ right: -20, opacity: .4 }} aria-hidden>
            <span className="k-orb" style={{ width: 64, height: 64, right: 14, top: -6 }} />
            <span className="k-ring" style={{ width: 36, height: 36, right: 80, top: 44 }} />
          </div>
        </header>

        <SettingsTabs calendar={calendarMode !== 'none'}>
          {/* ── Connections ─────────────────────────────────────────── */}
          <SettingsPanel id="connections">
            <section className="k-sec" style={{ marginBottom: 18 }}>
              <div className="k-sec-head">
                <span className="k-sec-icon" aria-hidden>🎙️</span>
                <div>
                  <h3>Lesson recorder</h3>
                  <p className="desc">The Chrome extension that records a lesson and turns it into a recap.</p>
                </div>
              </div>
              <ExtTokenPanel
                token={(extToken as any)?.token ?? null}
                lastUsedAt={(extToken as any)?.last_used_at ?? null}
              />
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <ReplayTourButton />
                <span className="desc" style={{ fontSize: 12 }}>Forgot what a page is for? The walkthrough runs again from here.</span>
              </div>
            </section>

            <section className="k-sec">
              <div className="k-sec-head">
                <span className="k-sec-icon" aria-hidden>🔗</span>
                <div>
                  <h3>Connections</h3>
                  <p className="desc">Connect the tools that power scheduling, meetings, and payments.</p>
                </div>
              </div>
              <ConnectorsGallery
                google={{ connected: Boolean(token), needsReconnect, email: token?.email }}
                zoom={zoom}
                stripe={stripe}
              />
            </section>

            {/* The onboarding answer, changeable — see lib/calendar-mode. */}
            <section className="k-sec">
              <div className="k-sec-head">
                <span className="k-sec-icon y" aria-hidden>🗓️</span>
                <div>
                  <h3>Where your lessons live</h3>
                  <p className="desc">
                    Keep them on Google Calendar and you get a booking page, free-slot scheduling and automatic
                    recording. Schedule elsewhere and the workspace drops all of that and works from recordings.
                  </p>
                </div>
              </div>
              <div className="k-choices">
                {CALENDAR_MODES.map((m) => (
                  <form key={m} action={chooseCalendarMode}>
                    <input type="hidden" name="mode" value={m} />
                    <button type="submit" className={`k-choice ${calendarMode === m ? 'sel' : ''}`}>
                      <span className="k-choice-tick" aria-hidden>✓</span>
                      <span>{CALENDAR_MODE_META[m].label}<small>{CALENDAR_MODE_META[m].hint}</small></span>
                    </button>
                  </form>
                ))}
              </div>
            </section>

            {/* Which calendar holds lessons (only when Google is connected) */}
            {token && !needsReconnect && calendars.length > 0 && (
              <section className="k-sec">
                <div className="k-sec-head">
                  <span className="k-sec-icon y" aria-hidden>📅</span>
                  <div>
                    <h3>Lesson calendar</h3>
                    <p className="desc">Which of your calendars holds the lessons Lesson Studio should read?</p>
                  </div>
                </div>
                <div className="k-choices">
                  {calendars.map((c) => {
                    const sel = c.id === selectedId || (c.primary && selectedId === 'primary')
                    return (
                      <form key={c.id} action="/api/google/select-calendar" method="post">
                        <input type="hidden" name="calendarId" value={c.id} />
                        <input type="hidden" name="calendarName" value={c.name} />
                        <button type="submit" className={`k-choice ${sel ? 'sel' : ''}`}>
                          <span className="k-choice-tick" aria-hidden>✓</span>
                          <span>
                            {c.name}
                            {c.primary && <small>Primary calendar</small>}
                          </span>
                        </button>
                      </form>
                    )
                  })}
                </div>
              </section>
            )}
          </SettingsPanel>

          {/* ── Booking preference: meeting platform + lesson defaults ── */}
          {calendarMode !== 'none' && (
          <SettingsPanel id="booking">
            <section className="k-sec">
              <div className="k-sec-head">
                <span className="k-sec-icon b" aria-hidden>🎥</span>
                <div>
                  <h3>Default meeting platform</h3>
                  <p className="desc">What a new booking creates. Pick the last one if your lessons live on a marketplace and the link is already theirs.</p>
                </div>
              </div>
              <div className="k-choices">
                <form action="/api/settings" method="post">
                  <input type="hidden" name="platform" value="google_meet" />
                  <button type="submit" className={`k-choice ${settings.platform === 'google_meet' ? 'sel' : ''}`}>
                    <span className="k-choice-tick" aria-hidden>✓</span>
                    <span>Google Meet<small>Created on your calendar</small></span>
                  </button>
                </form>
                {/* Offerable only to a teacher who already has Zoom connected —
                    the connector is coming soon, and a platform you cannot
                    connect is a booking that silently makes no room. */}
                <form action="/api/settings" method="post">
                  <input type="hidden" name="platform" value="zoom" />
                  <button
                    type="submit"
                    className={`k-choice ${settings.platform === 'zoom' ? 'sel' : ''}`}
                    disabled={!zoom.connected && settings.platform !== 'zoom'}
                  >
                    <span className="k-choice-tick" aria-hidden>✓</span>
                    <span>Zoom<small>{zoom.connected ? 'Created on your Zoom account' : 'Coming soon'}</small></span>
                  </button>
                </form>
                <form action="/api/settings" method="post">
                  <input type="hidden" name="platform" value="none" />
                  <button type="submit" className={`k-choice ${settings.platform === 'none' ? 'sel' : ''}`}>
                    <span className="k-choice-tick" aria-hidden>✓</span>
                    <span>I share my own link<small>Preply, italki, or a room of your own</small></span>
                  </button>
                </form>
              </div>
            </section>
          </SettingsPanel>
          )}

          {/* Lesson defaults (booking) + working hours (availability) */}
          {calendarMode !== 'none' && <AvailabilityEditor config={bookingConfig} />}
        </SettingsTabs>
      </main>
    </>
  )
}
