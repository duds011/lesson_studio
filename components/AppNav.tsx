'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/** Open-book logo mark (Lucide "book-open"). */
export function LogoMark() {
  return (
    <span className="mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    </span>
  )
}

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/students', label: 'Students' },
  { href: '/settings', label: 'Settings' },
]

export default function AppNav({
  email,
  connected,
}: {
  email?: string | null
  connected?: boolean
}) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav>
      <div className="nav-in">
        <Link className="logo" href="/">
          <LogoMark />
          <span className="brand-word">Lesson Studio</span>
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link ${isActive(l.href) ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
          <a href="/book" className="nav-link" target="_blank" rel="noreferrer">
            Booking page ↗
          </a>
        </div>
        <div className="nav-right">
          <span className={`cal-chip ${connected ? 'on' : ''}`}>
            <span className="dot" />
            {connected ? email : 'Calendar not connected'}
          </span>
        </div>
      </div>
    </nav>
  )
}

/** Minimal header for public / student-facing pages. */
export function PublicNav({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  return (
    <nav>
      <div className="nav-in">
        <Link className="logo" href={backHref ?? '/'}>
          <LogoMark />
          <span className="brand-word">Lesson Studio</span>
        </Link>
        <div className="nav-right">
          {backHref && (
            <Link className="btn btn-ghost btn-sm" href={backHref}>
              {backLabel ?? 'Back'}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
