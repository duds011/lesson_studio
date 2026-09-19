import Link from 'next/link'
import type { Messages } from '@/lib/i18n'
/**
 * The student portal's header, replacing the icon rail.
 *
 * Once booking left the portal the rail held a single link to the page you
 * were already on, plus sign-out — a whole column of furniture for one button.
 * The two things it genuinely carried, whose space this is and the way out,
 * fit on one line.
 */
export default function StudentTopBar({ mark, name, t }: { mark?: string; name?: string; t: Messages }) {
  return (
    <header className="k-bar">
      <div className="k-bar-brand">
        <span className="k-bar-mark" aria-hidden>
          {mark ? (
            <span style={{ fontSize: (mark?.length ?? 0) > 2 ? 12 : 15, fontWeight: 800, lineHeight: 1 }}>{mark}</span>
          ) : (
            <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h7v14H4zM13 5h7v9h-7z" />
            </svg>
          )}
        </span>
        {name && <span className="k-bar-name">{name}</span>}
      </div>

      <nav className="k-bar-acts">
        {/* The only door a student has to their own account. Until it existed,
            a portal that had guessed their language wrong was a portal they
            could not read their way out of. */}
        <Link href="/student/settings" className="k-bar-out">
          <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>{t.nav.settings}</span>
        </Link>

        {/* Plain <a>: a Next <Link> prefetches, and a prefetch of /logout signs
            the student out seconds after they arrive. */}
        <a href="/logout" className="k-bar-out">
          <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17l5-5-5-5M20 12H9M12 4H5v16h7" />
          </svg>
          <span>{t.common.signOut}</span>
        </a>
      </nav>
    </header>
  )
}
