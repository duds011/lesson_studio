'use client'

import { useEffect, useState, useTransition } from 'react'
import { useT } from '@/components/I18nProvider'

export type Choice = { value: string; label: string; hint?: string }

/**
 * A row of pick-one cards that answers the click, not the round trip.
 *
 * These were plain `<form action={serverAction}>` pairs: the tick came from the
 * server's idea of the value, so nothing at all happened on screen until a
 * write, a revalidate and a re-render had all completed. When every one of
 * those worked it was merely slow. When the last step did not land — a
 * deployment swapping under the tab, a router cache that kept the old payload,
 * anything at all between the server and the paint — the setting was saved and
 * the page went on showing the opposite. The teacher clicks again. And again.
 * There is no way to tell that apart from a dead button.
 *
 * So the selection lives here. The click moves the tick immediately, the write
 * goes out behind it, and if the write says no the tick goes back where it was
 * and says so in a sentence. The server stays the truth — `value` changing
 * (a reload, a second tab, another device) overrules whatever is on screen.
 *
 * Handing the server action in as a prop rather than calling it through a form
 * is the point: it lets the result be inspected, which `<form action>` gives
 * no way to do.
 */
export default function ChoiceGroup({
  name,
  value,
  options,
  action,
}: {
  /** The form field the action reads — 'on', 'mode', and so on. */
  name: string
  /** The selected option, as the server currently has it. */
  value: string
  options: Choice[]
  action: (formData: FormData) => Promise<{ ok: boolean } | void>
}) {
  const t = useT()
  const [picked, setPicked] = useState(value)
  const [failed, setFailed] = useState(false)
  const [pending, start] = useTransition()

  // The server wins whenever it has something new to say — including a value
  // this tab never chose, because a teacher can have Settings open twice.
  useEffect(() => setPicked(value), [value])

  function choose(next: string) {
    if (next === picked || pending) return
    const previous = picked
    setPicked(next)
    setFailed(false)
    start(async () => {
      const data = new FormData()
      data.set(name, next)
      try {
        const res = await action(data)
        if (res && res.ok === false) throw new Error('rejected')
      } catch {
        // Putting the tick back where it was is the whole message: leaving it
        // on the choice we failed to save would say the opposite of what
        // happened. The sentence underneath explains it.
        setPicked(previous)
        setFailed(true)
      }
    })
  }

  return (
    <>
      <div className="k-choices" role="radiogroup">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={picked === o.value}
            disabled={pending}
            onClick={() => choose(o.value)}
            className={`k-choice ${picked === o.value ? 'sel' : ''}`}
          >
            <span className="k-choice-tick" aria-hidden>✓</span>
            <span>{o.label}{o.hint && <small>{o.hint}</small>}</span>
          </button>
        ))}
      </div>
      {failed && (
        <p className="desc" style={{ color: 'var(--red)', marginTop: 10 }}>
          {t.common.somethingWrong}
        </p>
      )}
    </>
  )
}
