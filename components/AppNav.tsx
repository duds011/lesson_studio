'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import GuidedTour from '@/components/GuidedTour'
import { useT } from '@/components/I18nProvider'
import Thinking from '@/components/portal/Thinking'

type IconName = 'home' | 'users' | 'calendar' | 'settings' | 'book' | 'eye' | 'arrow' | 'external' | 'wallet' | 'clock' | 'collapse' | 'note' | 'menu' | 'close'

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.12.37.34.7.64.96.3.25.68.4 1.07.4H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    arrow: <><path d="m9 18 6-6-6-6"/></>,
    external: <><path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h7"/></>,
    wallet: <><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M21 12a2 2 0 0 0-2-2h-5a2 2 0 0 0 0 4h5a2 2 0 0 0 2-2Z"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    note: <><path d="M5 3h14v14l-4 4H5z"/><path d="M15 21v-4h4M9 8h6M9 12h4"/></>,
    // The panel glyph, not a chevron: a frame with the rail drawn inside it, so
    // the button shows the thing it collapses rather than a direction.
    collapse: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></>,
    menu: <><path d="M3 6h18M3 12h18M3 18h18"/></>,
    close: <><path d="M6 6l12 12M18 6 6 18"/></>,
  }
  return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

/**
 * An orb standing in an icon's place. The 18px box is the icon's own footprint,
 * so swapping one for the other moves no label by a pixel.
 */
function NavWait() {
  return (
    <span className="ui-icon" style={{ display: 'grid', placeItems: 'center', overflow: 'visible' }}>
      <Thinking size={20} />
    </span>
  )
}

export function LogoMark() {
  return <span className="mark" aria-hidden="true"><Icon name="book" /></span>
}

/**
 * `tour` is the anchor the guided walkthrough spotlights — see GuidedTour.
 *
 * `key` names the label in the dictionary rather than holding it. A module
 * constant is evaluated once at import, so an English label baked in here
 * would survive every language change on the page.
 */
const LINKS = [
  { href: '/', key: 'overview', icon: 'home' as IconName, tour: 'overview' },
  { href: '/teacher/dashboard', key: 'students', icon: 'users' as IconName, tour: 'students' },
  { href: '/teacher/notes', key: 'notes', icon: 'note' as IconName, tour: 'notes' },
  { href: '/teacher/materials', key: 'materials', icon: 'book' as IconName, tour: 'materials' },
  { href: '/teacher/branding', key: 'studentView', icon: 'eye' as IconName, tour: 'student-view' },
] as const

/** Remembered per browser, and read straight off the root element so the
 *  --sidebar width the whole layout is built on collapses with it. */
const NAV_KEY = 'nav-collapsed'

/**
 * `calendar` used to drop the Availability link for a teacher who keeps no
 * calendar. That link is gone for everyone now — Settings has no
 * Availability tab to point at — but the prop stays because the sidebar
 * account line still reports whether a calendar is connected.
 */
export default function AppNav({ email, connected, calendar = true }: { email?: string | null; connected?: boolean; calendar?: boolean }) {
  const t = useT()
  const pathname = usePathname()
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  const accountLabel = email?.split('@')[0] || t.nav.workspace
  const [collapsed, setCollapsed] = useState(false)
  // The phone drawer. Closed is the resting state; opening is always a tap on
  // the top-bar button, and navigating anywhere closes it again.
  const [mobileOpen, setMobileOpen] = useState(false)
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // The rail answers the click; the server answers later. Every tab in here is
  // a force-dynamic page that reads Supabase before it can render, so the gap
  // between the tap and the new page is real and long enough to read as a dead
  // click. The orb takes the clicked tab's own icon slot for exactly that gap.
  // It is cleared by the new pathname landing, which is also why a link that
  // leads where we already are never starts one: nothing would come to end it.
  const [pending, setPending] = useState<string | null>(null)
  useEffect(() => { setPending(null) }, [pathname])
  const startNav = (href: string) => { if (href.split('#')[0] !== pathname) setPending(href) }

  useEffect(() => {
    const saved = localStorage.getItem(NAV_KEY) === '1'
    setCollapsed(saved)
    document.documentElement.dataset.nav = saved ? 'collapsed' : ''
  }, [])

  const toggleNav = () => {
    setCollapsed((was) => {
      const next = !was
      localStorage.setItem(NAV_KEY, next ? '1' : '0')
      document.documentElement.dataset.nav = next ? 'collapsed' : ''
      return next
    })
  }

  return (
    <>
    {/* Mounted here because this nav is on every teacher page — the tour can
        start on first sign-in and be replayed from Settings without either
        page knowing about it. */}
    <GuidedTour email={email} />

    {/* Phone chrome: a slim bar with the logo and one button. The nav itself
        never lives up here — it slides in from the side, the same rail as on
        desktop, so the app has one navigation and two ways to summon it. */}
    <header className="mobile-topbar">
      <Link className="logo" href="/" aria-label={t.nav.overviewAria}>
        <LogoMark />
        <span className="brand-word">{t.nav.appName}</span>
      </Link>
      <button
        type="button"
        className="mobile-nav-btn"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="teacher-nav"
        aria-label={mobileOpen ? t.common.close : t.nav.openMenu}
      >
        <Icon name={mobileOpen ? 'close' : 'menu'} />
      </button>
    </header>
    {mobileOpen && <div className="mobile-nav-scrim" onClick={() => setMobileOpen(false)} aria-hidden />}

    <aside id="teacher-nav" className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`} aria-label={t.nav.navAria}>
      <div className="sidebar-top">
        <Link className="logo" href="/" aria-label={t.nav.overviewAria}>
          <LogoMark />
          <span><span className="brand-word">{t.nav.appName}</span><small>{t.nav.workspace}</small></span>
        </Link>
        <button
          type="button"
          className="nav-toggle"
          onClick={toggleNav}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t.nav.expand : t.nav.collapse}
          title={collapsed ? t.nav.expand : t.nav.collapse}
        >
          <Icon name="collapse" />
        </button>
      </div>

      <div className="sidebar-scroll">
        <div className="nav-section-label">{t.nav.sectionWorkspace}</div>
        <nav className="side-nav">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} data-tour={link.tour} onClick={() => startNav(link.href)} className={`side-link ${isActive(link.href) ? 'active' : ''}`}>
              {pending === link.href ? <NavWait /> : <Icon name={link.icon} />}<span>{t.nav[link.key]}</span>
            </Link>
          ))}
        </nav>

        <div className="nav-section-label">{t.nav.sectionManage}</div>
        <nav className="side-nav">
          {/* No Booking page link: the booking page is what Availability
              produces, so its preview button lives in that panel instead. */}
          <Link href="/settings" data-tour="settings" onClick={() => startNav('/settings')} className={`side-link ${isActive('/settings') ? 'active' : ''}`}>
            {pending === '/settings' ? <NavWait /> : <Icon name="settings" />}<span>{t.nav.settings}</span>
          </Link>
        </nav>

        {/* A button, not a sixth nav link.
            Buying write-ups used to be a tab inside Settings — three clicks
            from anywhere, behind a gear, which is not where anyone looks for
            a shop. It is the one action the business depends on, so it gets
            the only filled control in the sidebar and says plainly what it
            does. */}
        <Link
          href="/teacher/recaps"
          onClick={() => startNav('/teacher/recaps')}
          className={`side-buy${isActive('/teacher/recaps') ? ' active' : ''}`}
        >
          {pending === '/teacher/recaps' ? <NavWait /> : <Icon name="wallet" />}
          <span>{t.billing.buyMore}</span>
        </Link>
      </div>

      <div className="sidebar-account">
        <span className="account-avatar">{accountLabel.charAt(0).toUpperCase()}</span>
        <span className="account-copy">
          <strong>{accountLabel}</strong>
          <small>
            <span className={`status-dot ${connected || !calendar ? 'online' : ''}`} />
            {connected ? t.nav.calendarConnected : calendar ? t.nav.setupNeeded : t.nav.recordingsOnly}
          </small>
        </span>
        <a href="/logout" className="btn btn-danger-ghost btn-sm" title={t.common.signOut} aria-label={t.common.signOut} style={{ padding: '6px 8px' }}>
          {t.common.signOut}
        </a>
      </div>
    </aside>
    </>
  )
}

export function PublicNav({ backHref, backLabel }: { backHref?: string; backLabel?: string }) {
  const t = useT()
  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <Link className="logo" href={backHref ?? '/'}><LogoMark /><span className="brand-word">{t.nav.appName}</span></Link>
        {backHref ? <Link className="btn btn-ghost btn-sm" href={backHref}>← {backLabel ?? t.common.back}</Link> : <span className="portal-label">{t.nav.studentPortal}</span>}
      </div>
    </header>
  )
}
