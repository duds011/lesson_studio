/**
 * The student portal's header, replacing the icon rail.
 *
 * Once booking left the portal the rail held a single link to the page you
 * were already on, plus sign-out — a whole column of furniture for one button.
 * The two things it genuinely carried, whose space this is and the way out,
 * fit on one line.
 */
export default function StudentTopBar({ mark, name }: { mark?: string; name?: string }) {
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

      {/* Plain <a>: a Next <Link> prefetches, and a prefetch of /logout signs
          the student out seconds after they arrive. */}
      <a href="/logout" className="k-bar-out">
        <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 17l5-5-5-5M20 12H9M12 4H5v16h7" />
        </svg>
        <span>Sign out</span>
      </a>
    </header>
  )
}
