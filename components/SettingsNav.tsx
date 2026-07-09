'use client'

import { useEffect, useState } from 'react'

const SECTIONS = [
  { id: 'connections', label: 'Connections' },
  { id: 'booking', label: 'Booking preference' },
  { id: 'availability', label: 'Availability' },
]

/** Sticky settings nav whose active highlight follows the section in view. */
export default function SettingsNav() {
  const [active, setActive] = useState('connections')

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  return (
    <aside className="settings-index" aria-label="Settings sections">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''} onClick={(e) => go(e, s.id)}>{s.label}</a>
      ))}
    </aside>
  )
}
