import type { Messages } from '@/lib/i18n'
// Gallery of teacher integrations — Google Calendar, and only that. Zoom and
// Stripe cards were removed: both sat at "Coming soon" indefinitely, which is
// an advert for something that does not exist on the one page a teacher opens
// to fix something.
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

function ConnectedPill({ label }: { label: string }) {
  return <span className="pill green" style={{ alignSelf: 'flex-start' }}><span className="dot" />{label}</span>
}

export interface ConnectorState {
  google: { connected: boolean; needsReconnect: boolean; email?: string | null }
}

/** A server component, so the copy comes from the caller — see RecordingsOverview. */
export default function ConnectorsGallery({ google, t }: ConnectorState & { t: Messages }) {
  return (
    <div className="connector-grid">
      {/* Google Calendar */}
      <div className="connector-card">
        <div className="connector-logo"><GoogleCalendarLogo /></div>
        <div className="connector-name">{t.connectors.googleName}</div>
        <div className="connector-desc">{t.connectors.googleDesc}</div>
        <div className="connector-foot">
          {!google.connected ? (
            <a className="btn btn-primary btn-sm" href="/api/google/auth">{t.connectors.connect}</a>
          ) : google.needsReconnect ? (
            <>
              <span className="pill amber" style={{ alignSelf: 'flex-start' }}><span className="dot" />{t.connectors.permissionNeeded}</span>
              <a className="btn btn-primary btn-sm" href="/api/google/auth">{t.connectors.reconnect}</a>
            </>
          ) : (
            <>
              <ConnectedPill label="Connected" />
              <div className="connector-sub">{google.email}</div>
              <form action="/api/google/disconnect" method="post"><button className="btn btn-ghost btn-sm" type="submit">{t.connectors.disconnect}</button></form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
