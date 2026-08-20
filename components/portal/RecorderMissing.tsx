import Link from 'next/link'
import { RECORDER_STORE_URL } from '@/lib/recorder'

/**
 * Says the quiet part: without the recorder, none of this works.
 *
 * Onboarding lets a teacher skip installing it, and skipping was silent — they
 * landed in a portal that looked finished and waited for lessons that could
 * never arrive, because nothing was recording them. This is the one thing the
 * platform cannot do on their behalf, so it stays on the overview until it is
 * done rather than being mentioned once during setup.
 *
 * "Done" is a teacher_ext_tokens row: it is written the first time the
 * extension signs in, so it means the recorder is installed AND connected to
 * this account, which is what actually matters.
 */
export default function RecorderMissing() {
  return (
    <section
      className="analytics-card"
      style={{ marginBottom: 16, borderColor: 'var(--amber)', background: '#fffdf6' }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden>🎙️</span>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <h2 className="section-heading" style={{ margin: 0 }}>Add the recorder to start</h2>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', margin: '6px 0 0', lineHeight: 1.6 }}>
            Lesson Studio writes recaps from your lessons, and the Chrome extension is what records them. Until it is
            installed and signed in, nothing will reach this page — there is no other way to get a lesson in.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <Link href="/recorder" className="btn btn-ghost btn-sm">
            Setup guide
          </Link>
          <Link
            href={RECORDER_STORE_URL}
            target="_blank"
            rel="noopener"
            className="btn btn-primary btn-sm"
          >
            Get the extension
          </Link>
        </div>
      </div>
    </section>
  )
}
