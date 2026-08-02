'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Narrow icon rail for the student portal (KOKU 2.0 look). Replaces the
 * top PortalNav on student pages. Collapses to a bottom bar under 720px.
 */

const I = ({ d }: { d: string }) => (
  <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const ICONS = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  lessons: 'M4 5h16v14H4zM4 9h16M9 9v10',
  tests: 'M9 3h6v3H9zM6 6h12v15H6zM9.5 12.5l1.8 1.8 3.4-3.4',
  book: 'M8 3v3m8-3v3M4 8h16M5 6h14v14H5z',
  progress: 'M4 20V10m5 10V5m5 15v-7m5 7V8',
} as const

const LINKS = [
  { href: '/student/dashboard', label: 'Dashboard', icon: ICONS.home },
  { href: '/student/book', label: 'Book a lesson', icon: ICONS.book },
]

export default function StudentRail({ mark }: { mark?: string }) {
  const pathname = usePathname()

  return (
    <aside className="k-rail">
      <div className="k-rail-mark" aria-hidden>
        {mark ? (
          <span style={{ fontSize: mark.length > 2 ? 13 : 16, fontWeight: 800, lineHeight: 1 }}>{mark}</span>
        ) : (
          <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h7v14H4zM13 5h7v9h-7z" />
          </svg>
        )}
      </div>

      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + '/')
        return (
          <Link key={l.href} href={l.href} className={`k-rail-link ${active ? 'active' : ''}`} title={l.label} aria-label={l.label}>
            <I d={l.icon} />
          </Link>
        )
      })}

      <div className="k-rail-spacer" />

      <Link href="/logout" className="k-rail-link" title="Sign out" aria-label="Sign out">
        <I d="M15 17l5-5-5-5M20 12H9M12 4H5v16h7" />
      </Link>
    </aside>
  )
}
