'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type IconName = 'home' | 'users' | 'calendar' | 'settings' | 'book' | 'arrow' | 'external'

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.12.37.34.7.64.96.3.25.68.4 1.07.4H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    arrow: <><path d="m9 18 6-6-6-6"/></>,
    external: <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h7"/></>,
  }
  return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function LogoMark() {
  return <span className="mark" aria-hidden="true"><Icon name="book" /></span>
}

const LINKS = [
  { href: '/', label: 'Overview', icon: 'home' as IconName },
  { href: '/teacher/dashboard', label: 'Students', icon: 'users' as IconName },
]

export default function AppNav({ email, connected }: { email?: string | null; connected?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  const accountLabel = email?.split('@')[0] || 'Teacher workspace'

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="app-sidebar" aria-label="Teacher workspace navigation">
      <div className="sidebar-top">
        <Link className="logo" href="/" aria-label="Lesson Studio overview">
          <LogoMark />
          <span><span className="brand-word">Lesson Studio</span><small>Teacher workspace</small></span>
        </Link>
      </div>

      <div className="sidebar-scroll">
        <div className="nav-section-label">Workspace</div>
        <nav className="side-nav">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`side-link ${isActive(link.href) ? 'active' : ''}`}>
              <Icon name={link.icon} /><span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="nav-section-label">Manage</div>
        <nav className="side-nav">
          <Link href="/book" className={`side-link ${isActive('/book') ? 'active' : ''}`} target="_blank">
            <Icon name="calendar" /><span>Booking page</span><Icon name="external" />
          </Link>
          <Link href="/settings" className={`side-link ${isActive('/settings') ? 'active' : ''}`}>
            <Icon name="settings" /><span>Settings</span>
          </Link>
        </nav>
      </div>

      <div className="sidebar-account">
        <span className="account-avatar">{accountLabel.charAt(0).toUpperCase()}</span>
        <span className="account-copy"><strong>{accountLabel}</strong><small><span className={`status-dot ${connected ? 'online' : ''}`} />{connected ? 'Calendar connected' : 'Setup needed'}</small></span>
        <button onClick={signOut} className="btn btn-ghost btn-sm" title="Sign out" aria-label="Sign out" style={{ padding: '6px 8px' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}

export function PublicNav({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <Link className="logo" href={backHref ?? '/'}><LogoMark /><span className="brand-word">Lesson Studio</span></Link>
        {backHref ? <Link className="btn btn-ghost btn-sm" href={backHref}>← {backLabel ?? 'Back'}</Link> : <span className="portal-label">Student portal</span>}
      </div>
    </header>
  )
}
