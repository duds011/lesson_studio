'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const ALL_TABS = [
  { id: 'connections', label: 'Connections', calendarOnly: false },
  { id: 'languages', label: 'Languages', calendarOnly: false },
  { id: 'subscription', label: 'Subscription', calendarOnly: false },
  { id: 'portal', label: 'Student portal', calendarOnly: false },
  { id: 'booking', label: 'Booking preference', calendarOnly: true },
  { id: 'availability', label: 'Availability', calendarOnly: true },
]

const TabCtx = createContext('connections')

/**
 * Settings shell: the rail switches between views instead of scrolling one long
 * page. Panels are hidden rather than unmounted so edits survive a tab switch.
 *
 * Booking and availability are both computed from Google free/busy, so a
 * teacher who keeps no calendar isn't shown two views that can do nothing.
 */
export default function SettingsTabs({ children, calendar = true }: { children: React.ReactNode; calendar?: boolean }) {
  const [active, setActive] = useState('connections')
  const TABS = ALL_TABS.filter((t) => calendar || !t.calendarOnly)

  // Deep links (/settings#availability) and back/forward pick the view.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1)
      if (ALL_TABS.some((t) => t.id === id && (calendar || !t.calendarOnly))) setActive(id)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [calendar])

  const go = (id: string) => {
    setActive(id)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="settings-layout">
      <nav className="settings-index" aria-label="Settings sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={active === t.id ? 'active' : ''}
            aria-current={active === t.id ? 'page' : undefined}
            onClick={() => go(t.id)}
          >
            {t.label}
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
