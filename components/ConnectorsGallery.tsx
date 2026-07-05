// Gallery of teacher integrations (Google Calendar, Zoom, Stripe) as uniform
// cards with brand logos, a description, status, and a connect/manage action.

function GoogleCalendarLogo() {
  return (
    <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
      <rect x="9" y="11" width="30" height="28" rx="5" fill="#fff" stroke="#e6e6e6" strokeWidth="1.5" />
      <path d="M9 16 a5 5 0 0 1 5-5 h20 a5 5 0 0 1 5 5 v1 H9 z" fill="#4285F4" />
      <circle cx="17" cy="10" r="1.7" fill="#5f6368" />
      <circle cx="31" cy="10" r="1.7" fill="#5f6368" />
      <text x="24" y="34" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="700" fill="#1a73e8">31</text>
    </svg>
  )
}
function ZoomLogo() {
  return (
    <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
      <rect x="7" y="7" width="34" height="34" rx="9" fill="#4A8CFF" />
      <path d="M15 19 h10 a2 2 0 0 1 2 2 v6 a2 2 0 0 1 -2 2 h-10 a2 2 0 0 1 -2 -2 v-6 a2 2 0 0 1 2 -2 z" fill="#fff" />
      <path d="M29 22 l6 -3.4 v10.8 l-6 -3.4 z" fill="#fff" />
    </svg>
  )
}
function StripeLogo() {
  return (
    <svg viewBox="0 0 48 48" width="30" height="30" aria-hidden="true">
      <rect x="7" y="7" width="34" height="34" rx="9" fill="#635BFF" />
      <text x="24" y="33" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="21" fontWeight="800" fill="#fff">S</text>
    </svg>
  )
}

function ConnectedPill({ label }: { label: string }) {
  return <span className="pill green" style={{ alignSelf: 'flex-start' }}><span className="dot" />{label}</span>
}

export interface ConnectorState {
  google: { connected: boolean; needsReconnect: boolean; email?: string | null }
  zoom: { configured: boolean; connected: boolean; email?: string | null }
  stripe: { connected: boolean; chargesEnabled: boolean }
}

export default function ConnectorsGallery({ google, zoom, stripe }: ConnectorState) {
  return (
    <div className="connector-grid">
      {/* Google Calendar */}
      <div className="connector-card">
        <div className="connector-logo"><GoogleCalendarLogo /></div>
        <div className="connector-name">Google Calendar</div>
        <div className="connector-desc">Reads your lessons and writes new bookings straight onto your calendar.</div>
        <div className="connector-foot">
          {!google.connected ? (
            <a className="btn btn-primary btn-sm" href="/api/google/auth">Connect</a>
          ) : google.needsReconnect ? (
            <>
              <span className="pill amber" style={{ alignSelf: 'flex-start' }}><span className="dot" />Permission needed</span>
              <a className="btn btn-primary btn-sm" href="/api/google/auth">Reconnect</a>
            </>
          ) : (
            <>
              <ConnectedPill label="Connected" />
              <div className="connector-sub">{google.email}</div>
              <form action="/api/google/disconnect" method="post"><button className="btn btn-ghost btn-sm" type="submit">Disconnect</button></form>
            </>
          )}
        </div>
      </div>

      {/* Zoom */}
      <div className="connector-card">
        <div className="connector-logo"><ZoomLogo /></div>
        <div className="connector-name">Zoom</div>
        <div className="connector-desc">Creates a unique Zoom room for each booked lesson automatically.</div>
        <div className="connector-foot">
          {!zoom.configured ? (
            <span className="pill amber" style={{ alignSelf: 'flex-start' }}><span className="dot" />Not set up</span>
          ) : !zoom.connected ? (
            <a className="btn btn-primary btn-sm" href="/api/zoom/auth">Connect</a>
          ) : (
            <>
              <ConnectedPill label="Connected" />
              {zoom.email && <div className="connector-sub">{zoom.email}</div>}
              <form action="/api/zoom/disconnect" method="post"><button className="btn btn-ghost btn-sm" type="submit">Disconnect</button></form>
            </>
          )}
        </div>
      </div>

      {/* Stripe */}
      <div className="connector-card">
        <div className="connector-logo"><StripeLogo /></div>
        <div className="connector-name">Stripe</div>
        <div className="connector-desc">Take card payments for lesson packages — payouts go straight to you.</div>
        <div className="connector-foot">
          {stripe.chargesEnabled ? (
            <>
              <ConnectedPill label="Connected" />
              <div className="connector-sub">Payouts enabled</div>
              <a className="btn btn-ghost btn-sm" href="/api/stripe/connect/start">Manage</a>
            </>
          ) : stripe.connected ? (
            <>
              <span className="pill amber" style={{ alignSelf: 'flex-start' }}><span className="dot" />Finish setup</span>
              <a className="btn btn-primary btn-sm" href="/api/stripe/connect/start">Continue</a>
            </>
          ) : (
            <a className="btn btn-primary btn-sm" href="/api/stripe/connect/start">Connect</a>
          )}
        </div>
      </div>
    </div>
  )
}
