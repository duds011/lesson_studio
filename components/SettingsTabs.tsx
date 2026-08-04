'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const TABS = [
  { id: 'connections', label: 'Connections' },
  { id: 'booking', label: 'Booking preference' },
  { id: 'availability', label: 'Availability' },
]

const TabCtx = createContext('connections')

/**
 * Settings shell: the rail switches between views instead of scrolling one long
 * page. Panels are hidden rather than unmounted so edits survive a tab switch.
 */
export default function SettingsTabs({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState('connections')

  // Deep links (/settings#availability) and back/forward pick the view.
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1)
      if (TABS.some((t) => t.id === id)) setActive(id)
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
