import { getToken } from '@/lib/store'
import { listCalendars, type CalendarInfo } from '@/lib/google'
import { getSettings } from '@/lib/settings'
import AppNav from '@/components/AppNav'
import ZoomStatus from '@/components/ZoomStatus'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const token = await getToken()
  const settings = await getSettings()

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

  return (
    <>
      <AppNav email={token?.email} connected={Boolean(token)} />
      <main className="wrap page-fade">
        <div className="page-head">
          <div>
            <span className="eyebrow">Settings</span>
            <h2 className="title">Connections &amp; preferences</h2>
            <p className="sub">Manage your calendar, meeting platform, and integrations.</p>
          </div>
        </div>

        {/* Google Calendar */}
        <div className="settings-card">
          <h3>Google Calendar</h3>
          <p className="desc">Lessons are read from — and bookings are written to — this calendar.</p>
          {!token ? (
            <a className="btn btn-primary" href="/api/google/auth">Connect Google Calendar</a>
          ) : needsReconnect ? (
            <div className="settings-row">
              <span className="pill amber"><span className="dot" />Wider permission needed</span>
              <a className="btn btn-primary btn-sm" href="/api/google/auth">Reconnect Google</a>
            </div>
          ) : (
            <>
              <div className="settings-row" style={{ marginBottom: '1rem' }}>
                <span className="pill green"><span className="dot" />Connected · {token.email}</span>
                <form action="/api/google/disconnect" method="post">
                  <button className="btn btn-danger-ghost btn-sm" type="submit">Disconnect</button>
                </form>
              </div>
              <p className="desc" style={{ marginBottom: '.6rem' }}>Which calendar holds your lessons?</p>
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
            </>
          )}
        </div>

        {/* Zoom */}
        <div className="settings-card">
          <h3>Zoom</h3>
          <p className="desc">Connect Zoom to create a unique Zoom meeting for each booking.</p>
          <ZoomStatus />
        </div>

        {/* Meeting platform */}
        <div className="settings-card">
          <h3>Meeting platform</h3>
          <p className="desc">Which platform should new bookings use?</p>
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
      </main>
    </>
  )
}
