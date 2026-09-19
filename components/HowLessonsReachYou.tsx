'use client'

import { useT } from '@/components/I18nProvider'
import { fill } from '@/lib/i18n'
import { useEffect, useState } from 'react'

const KEY = 'ls.howLessonsReachYou.dismissed'

/**
 * The three-step explainer at the top of the overview, with a way out.
 *
 * It earns its place on day one and becomes furniture by week two, so it
 * closes. The choice is kept in localStorage rather than the profile: it is a
 * preference about this screen, not a fact about the teacher, and a column plus
 * a write path for one boolean is more machinery than it deserves.
 *
 * Nothing renders until the effect has read that key. Rendering the panel first
 * and hiding it a tick later would flash it back at someone who has already
 * dismissed it every single time they load the page.
 */
export default function HowLessonsReachYou({ platformLabel }: { platformLabel: string }) {
  const t = useT()
  const [state, setState] = useState<'unknown' | 'show' | 'hidden'>('unknown')

  useEffect(() => {
    let dismissed = false
    try { dismissed = localStorage.getItem(KEY) === '1' } catch { /* private mode — just show it */ }
    setState(dismissed ? 'hidden' : 'show')
  }, [])

  if (state !== 'show') return null

  const dismiss = () => {
    try { localStorage.setItem(KEY, '1') } catch { /* not persisted, still closes */ }
    setState('hidden')
  }

  return (
    <section className="k-sec" style={{ position: 'relative' }}>
      <button type="button" className="k-sec-close" onClick={dismiss}>
        Got it — hide this <span aria-hidden>×</span>
      </button>

      <div className="k-sec-head">
        <span className="k-sec-icon" aria-hidden>🎙️</span>
        <div>
          <h3>{t.misc.howTitle}</h3>
          <p className="desc">{fill(t.misc.howLead, { platform: platformLabel })}</p>
        </div>
      </div>

      {t.misc.howSteps.map(({ title, body: note }, i) => (
        <div key={title} className="k-onb-ok" style={i > 0 ? { marginTop: 10 } : undefined}>
          <span aria-hidden>{i + 1}</span>
          <div><strong>{title}</strong><small>{note}</small></div>
        </div>
      ))}
    </section>
  )
}
