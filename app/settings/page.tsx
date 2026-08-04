import { getToken } from '@/lib/store'
import { listCalendars, type CalendarInfo } from '@/lib/google'
import { getSettings } from '@/lib/settings'
import { getBookingConfig } from '@/lib/booking'
import { zoomConnection, isZoomConfigured } from '@/lib/zoom'
import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/AppNav'
import AvailabilityEditor from '@/components/AvailabilityEditor'
import ConnectorsGallery from '@/components/ConnectorsGallery'
import SettingsTabs, { SettingsPanel } from '@/components/SettingsTabs'

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
    ? await supabase.from('profiles').select('stripe_account_id, stripe_charges_enabled').eq('id', user.id).single()
    : { data: null }
  const stripe = {
    connected: Boolean((profile as any)?.stripe_account_id),
    chargesEnabled: Boolean((profile as any)?.stripe_charges_enabled),
  }

  return (
    <>
      <AppNav email={token?.email} connected={Boolean(token)} />
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

        <SettingsTabs>
          {/* ── Connections ─────────────────────────────────────────── */}
          <SettingsPanel id="connections">
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
          <SettingsPanel id="booking">
            <section className="k-sec">
              <div className="k-sec-head">
                <span className="k-sec-icon b" aria-hidden>🎥</span>
                <div>
                  <h3>Default meeting platform</h3>
                  <p className="desc">The service used to create meeting links for new bookings.</p>
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
                <form action="/api/settings" method="post">
                  <input type="hidden" name="platform" value="zoom" />
                  <button type="submit" className={`k-choice ${settings.platform === 'zoom' ? 'sel' : ''}`}>
                    <span className="k-choice-tick" aria-hidden>✓</span>
                    <span>Zoom<small>Requires a connected Zoom account</small></span>
                  </button>
                </form>
              </div>
            </section>
          </SettingsPanel>

          {/* Lesson defaults (booking) + working hours (availability) */}
          <AvailabilityEditor config={bookingConfig} />
        </SettingsTabs>
      </main>
    </>
  )
}
