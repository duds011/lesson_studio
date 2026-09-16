'use client'

import { useEffect, useState } from 'react'

export type DashboardTab = { id: string; label: string; content: React.ReactNode }

/**
 * The student dashboard, one tab at a time. Panels are hidden rather than
 * unmounted so a chart doesn't redraw and a scrolled lesson drum keeps its
 * place when the student comes back to it.
 *
 * The open tab lives in the URL hash. It used to live only in state, which
 * meant every arrival landed on the first tab — so finishing a round of
 * flashcards and pressing Back put you in Lessons, several taps from the thing
 * you were in the middle of. It also makes the tab survive a refresh, and makes
 * a link to `#practice` mean something.
 */
export default function DashboardTabs({ tabs }: { tabs: DashboardTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id)

  /**
   * Read on mount rather than during render: the server cannot see the hash, so
   * deciding from it while rendering would make the server's HTML and the first
   * client paint disagree. The first tab paints, then the hash corrects it.
   */
  useEffect(() => {
    const fromHash = () => {
      // Matched case-insensitively: the tab ids are display labels ('Practice'),
      // and a link written by hand is going to say '#practice'. Both should work.
      const want = decodeURIComponent(window.location.hash.replace(/^#/, '')).toLowerCase()
      if (!want) return
      const hit = tabs.find((t) => t.id.toLowerCase() === want)
      if (hit) setActive(hit.id)
    }
    fromHash()
    // Back and forward should move between tabs, because choosing one is what a
    // reader experiences as navigation.
    window.addEventListener('hashchange', fromHash)
    return () => window.removeEventListener('hashchange', fromHash)
  }, [tabs])

  if (tabs.length === 0) return null

  function choose(id: string) {
    setActive(id)
    // replaceState rather than assigning location.hash: assigning it scrolls
    // the matching element into view and pushes a history entry, so Back would
    // walk through every tab the reader had glanced at.
    history.replaceState(null, '', `#${id.toLowerCase()}`)
  }

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
            onClick={() => choose(t.id)}
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
