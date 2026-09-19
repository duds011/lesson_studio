'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useT } from '@/components/I18nProvider'

/**
 * Booking preference and Availability are gone, and now so is Lessons.
 *
 * The first two configured a booking page almost nobody reached, and on a
 * phone the tab strip scrolls — so they were two swipes away from every
 * teacher rather than hidden behind a calendar setting. The `calendarOnly`
 * flag they were the only users of went with them.
 *
 * Lessons went for a different reason: it held the write-up balance and the
 * packs, and buying is not a setting. Both are a page of their own now, at
 * /teacher/recaps, reached from the sidebar.
 *
 * The labels are indexes into the dictionary rather than strings. A module
 * constant is evaluated once at import, so an English label written here would
 * survive every language change on the page — the same trap the nav links hit.
 */
const ALL_TABS = [
  { id: 'connections', label: 0 },
  { id: 'languages', label: 1 },
  { id: 'portal', label: 2 },
] as const

const TabCtx = createContext('connections')

/**
 * Settings shell: the rail switches between views instead of scrolling one long
 * page. Panels are hidden rather than unmounted so edits survive a tab switch.
 *
 * Booking and availability are both computed from Google free/busy, so a
 * teacher who keeps no calendar isn't shown two views that can do nothing.
 */
export default function SettingsTabs({ children }: { children: React.ReactNode }) {
  const t = useT()
  const [active, setActive] = useState('connections')
  const TABS = ALL_TABS

  // Deep links (/settings#availability) and back/forward pick the view.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1)
      if (ALL_TABS.some((t) => t.id === id)) setActive(id)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [])

  const go = (id: string) => {
    setActive(id)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="settings-layout">
      <nav className="settings-index" aria-label={t.settings.sectionsAria}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={active === tab.id ? 'active' : ''}
            aria-current={active === tab.id ? 'page' : undefined}
            onClick={() => go(tab.id)}
          >
            {t.settings.tabs[tab.label]}
          </button>
        ))}
      </nav>
      <TabCtx.Provider value={active}>
        <div className="settings-stack">{children}</div>
      </TabCtx.Provider>
    </div>
  )
}

/** One settings view. Several panels may share an id — they show together. */
export function SettingsPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const active = useContext(TabCtx)
  return <div className="settings-view" hidden={active !== id}>{children}</div>
}
