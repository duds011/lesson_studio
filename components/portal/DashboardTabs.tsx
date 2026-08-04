'use client'

import { useState } from 'react'

export type DashboardTab = { id: string; label: string; content: React.ReactNode }

/**
 * The student dashboard, one tab at a time. Panels are hidden rather than
 * unmounted so a chart doesn't redraw and a scrolled lesson drum keeps its
 * place when the student comes back to it.
 */
export default function DashboardTabs({ tabs }: { tabs: DashboardTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id)
  if (tabs.length === 0) return null

  return (
    <>
      <div className="k-dtabs" role="tablist" aria-label="Dashboard sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            className={active === t.id ? 'on' : ''}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div key={t.id} className="k-flow" role="tabpanel" aria-label={t.label} hidden={active !== t.id}>
          {t.content}
        </div>
      ))}
    </>
  )
}
