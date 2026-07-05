import { getToken } from '@/lib/store'
import { listCalendars, type CalendarInfo } from '@/lib/google'
import { getSettings } from '@/lib/settings'
import { getBookingConfig } from '@/lib/booking'
import { zoomConnection, isZoomConfigured } from '@/lib/zoom'
import { createClient } from '@/lib/supabase/server'
import AppNav from '@/components/AppNav'
import AvailabilityEditor from '@/components/AvailabilityEditor'
import ConnectorsGallery from '@/components/ConnectorsGallery'

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
      <main className="wrap page-fade">
        <div className="page-head">
          <div>
            <span className="eyebrow">Workspace</span>
            <h2 className="title">Settings</h2>
            <p className="sub">Keep lesson scheduling and recording services connected.</p>
          </div>
        </div>

        <div className="settings-layout">
          <aside className="settings-index" aria-label="Settings sections">
            <a href="#connections">Connections</a>
            <a href="#booking">Booking preference</a>
            <a href="#availability">Availability</a>
          </aside>
          <div className="settings-stack">
        {/* Connectors gallery */}
        <div className="settings-card" id="connections">
          <h3>Connections</h3>
          <p className="desc">Connect the tools that power scheduling, meetings, and payments.</p>
          <ConnectorsGallery
            google={{ connected: Boolean(token), needsReconnect, email: token?.email }}
            zoom={zoom}
            stripe={stripe}
          />
        </div>

        {/* Which calendar holds lessons (only when Google is connected) */}
        {token && !needsReconnect && calendars.length > 0 && (
          <div className="settings-card">
            <h3>Lesson calendar</h3>
            <p className="desc">Which calendar holds your lessons?</p>
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
          </div>
        )}

        {/* Meeting platform */}
        <div className="settings-card" id="booking">
          <h3>Default meeting platform</h3>
          <p className="desc">Choose the service used for future bookings.</p>
          <div className="cal-picker">
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
          </div>
        </div>

        {/* Availability & booking rules */}
        <AvailabilityEditor config={bookingConfig} />
          </div>
        </div>
      </main>
    </>
  )
}
