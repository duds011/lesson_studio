import type { Messages } from '@/lib/i18n'
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

/** A server component, so the copy comes from the caller — see RecordingsOverview. */
export default function ConnectorsGallery({ google, zoom, stripe, t }: ConnectorState & { t: Messages }) {
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

      {/* Zoom — coming soon. A teacher who already connected keeps their
          account and can still disconnect it; nobody new is offered the flow
          until the Zoom app is through review. */}
      <div className="connector-card" style={zoom.connected ? undefined : { opacity: 0.72 }}>
        <div className="connector-logo"><ZoomLogo /></div>
        <div className="connector-name">Zoom</div>
        <div className="connector-desc">{t.connectors.zoomDesc}</div>
        <div className="connector-foot">
          {zoom.connected ? (
            <>
              <ConnectedPill label="Connected" />
              {zoom.email && <div className="connector-sub">{zoom.email}</div>}
              <form action="/api/zoom/disconnect" method="post"><button className="btn btn-ghost btn-sm" type="submit">{t.connectors.disconnect}</button></form>
            </>
          ) : (
            <span className="pill" style={{ alignSelf: 'flex-start', background: 'var(--brand-soft)', color: 'var(--brand)' }}>{t.connectors.comingSoon}</span>
          )}
        </div>
      </div>

      {/* Stripe — coming soon */}
      <div className="connector-card" style={{ opacity: 0.72 }}>
        <div className="connector-logo"><StripeLogo /></div>
        <div className="connector-name">{t.connectors.stripeName}</div>
        <div className="connector-desc">{t.connectors.stripeDesc}</div>
        <div className="connector-foot">
          <span className="pill" style={{ alignSelf: 'flex-start', background: 'var(--brand-soft)', color: 'var(--brand)' }}>{t.connectors.comingSoon}</span>
        </div>
      </div>
    </div>
  )
}
