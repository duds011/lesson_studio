'use client'

import { useState, useTransition } from 'react'
import { setUiLanguage } from '@/app/actions/ui-language'
import { LOCALES, LOCALE_NAMES, type Locale } from '@/lib/i18n/config'
import { useT } from '@/components/I18nProvider'

/**
 * Settings → the language the app speaks.
 *
 * Buttons rather than a <select>, for the same reason the language names are
 * endonyms: somebody who has landed in a language they cannot read needs to
 * find their own on sight. A select hides six of the seven behind a tap and
 * shows the one they are stuck in.
 *
 * The save reloads the whole layout (see the action), so the page redraws in
 * the new language by itself — there is nothing to show afterwards except
 * that it worked, and by then the labels around it have already changed.
 */
export default function LanguagePicker({ current }: { current: Locale }) {
  const t = useT()
  const [picked, setPicked] = useState<Locale>(current)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function choose(locale: Locale) {
    if (locale === picked || pending) return
    const previous = picked
    setPicked(locale)
    setError(null)
    start(async () => {
      const res = await setUiLanguage(locale)
      if (!res.success) {
        // Put the highlight back where it was: leaving it on the language we
        // failed to save says the opposite of what happened.
        setPicked(previous)
        setError(res.error ?? t.common.somethingWrong)
      }
    })
  }

  return (
    <>
      <div className="k-lang-grid">
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => choose(l)}
            aria-pressed={picked === l}
            disabled={pending}
            className={`k-lang${picked === l ? ' is-on' : ''}`}
            lang={l}
          >
            {LOCALE_NAMES[l]}
          </button>
        ))}
      </div>
      {error && (
        <p className="desc" style={{ color: 'var(--red)', marginTop: 10 }}>
          {error}
        </p>
      )}
    </>
  )
}
