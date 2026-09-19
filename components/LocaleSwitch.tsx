'use client'

import { LOCALES, LOCALE_COOKIE, LOCALE_NAMES, type Locale } from '@/lib/i18n/config'
import { useLocale, useT } from '@/components/I18nProvider'

/**
 * The language control for pages nobody is signed in to.
 *
 * Settings is where a teacher changes this, but you cannot reach Settings
 * without an account — and the login page is exactly where somebody who
 * cannot read English is stuck. So it lives here too, in the corner.
 *
 * Writing the cookie and reloading, rather than swapping a context value,
 * because these pages resolve their locale on the SERVER: a client-side
 * switch would translate the form and leave the half that was rendered into
 * the HTML behind. A reload is one request and makes the whole page agree.
 *
 * Plain links to the same URL rather than buttons would be nicer for
 * no-JavaScript, but the cookie has to be set first — and a server action for
 * a language toggle on a login page is a lot of machinery for a control that
 * only matters to someone who already has JavaScript running the form.
 */
export default function LocaleSwitch() {
  const current = useLocale()
  const t = useT()

  function pick(l: Locale) {
    if (l === current) return
    // A year, on the whole site, so it survives the trip through signup and
    // is still there next time they come back to sign in.
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`
    window.location.reload()
  }

  return (
    <div className="k-auth-lang" role="group" aria-label={t.misc.languageGroup}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          onClick={() => pick(l)}
          aria-pressed={l === current}
          className={l === current ? 'is-on' : undefined}
        >
          {LOCALE_NAMES[l]}
        </button>
      ))}
    </div>
  )
}
