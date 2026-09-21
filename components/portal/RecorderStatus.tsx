import type { Messages } from '@/lib/i18n'
import Link from 'next/link'
import { fill } from '@/lib/i18n'
import { RECORDER_STORE_URL } from '@/lib/recorder'
import { formatDateShort } from '@/lib/portal-utils'

/**
 * Whether the recorder is installed, said out loud, on every visit.
 *
 * Onboarding lets a teacher skip installing it, and skipping was silent — they
 * landed in a workspace that looked finished and waited for lessons that could
 * never arrive, because nothing was recording them. This is the one thing the
 * platform cannot do on their behalf.
 *
 * It replaced a three-step explainer that closed on a "Got it — hide this"
 * button: a teacher who had not installed anything could dismiss the only
 * thing on the page that would have told them so, and the panel never came
 * back. So this one does not close. It changes instead — the same block
 * reports "not installed" and then "connected", which is what makes the state
 * readable rather than a notice you get rid of.
 *
 * "Connected" is a teacher_ext_tokens row: written the first time the
 * extension signs in, so it means installed AND signed in to this account,
 * which is the only version of installed that matters here.
 */
export default function RecorderStatus({ t, connected, lastUsedAt }: {
  t: Messages
  connected: boolean
  lastUsedAt?: string | null
}) {
  const s = t.recorderStatus

  return (
    <section
      className="analytics-card"
      style={{
        marginBottom: 16,
        borderColor: connected ? 'var(--line)' : 'var(--amber)',
        background: connected ? '#fff' : '#fffdf6',
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>🎙️</span>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          {/* A dot and a sentence, not a badge: the state is the heading. */}
          <p
            style={{
              margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: connected ? 'var(--green)' : 'var(--amber)',
            }}
          >
            <span aria-hidden>{connected ? '●' : '○'}</span>{' '}
            {connected ? s.readyPill : s.missingPill}
          </p>
          <h2 className="section-heading" style={{ margin: '6px 0 0' }}>
            {connected ? s.readyTitle : s.missingTitle}
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '6px 0 0', lineHeight: 1.6 }}>
            {connected ? s.readyBody : s.missingBody}
          </p>
          {/* The whole point of not asking them to confirm anything: they
              install it over there, and this says so by itself. */}
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '8px 0 0', lineHeight: 1.6 }}>
            {connected
              ? (lastUsedAt ? fill(s.lastRecording, { date: formatDateShort(lastUsedAt) }) : s.nothingYet)
              : s.auto}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {connected ? (
            <Link href="/settings" className="btn btn-ghost btn-sm">{s.check}</Link>
          ) : (
            <>
              <Link href="/recorder" className="btn btn-ghost btn-sm">{s.setupGuide}</Link>
              <Link href={RECORDER_STORE_URL} target="_blank" rel="noopener" className="btn btn-primary btn-sm">
                {s.getExtension}
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
