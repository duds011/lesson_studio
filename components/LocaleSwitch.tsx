'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LOCALES, LOCALE_COOKIE, LOCALE_NAMES, type Locale } from '@/lib/i18n/config'
import { useLocale, useT } from '@/components/I18nProvider'
import { setUiLanguage } from '@/app/actions/ui-language'

/**
 * The language control in the corner.
 *
 * Settings is where a teacher changes this, but you cannot reach Settings
 * without an account — and the login page is exactly where somebody who
 * cannot read English is stuck. So it lives there too, and on onboarding,
 * which is a signed-in page that a teacher meets before they have ever seen
 * Settings.
 *
 * Where the answer is kept depends on whether there is an account to keep it
 * on. `cookie` for the signed-out pages; `account` writes profiles.ui_language
 * so it survives to the next device instead of to the next visit in this
 * browser. Both then re-render from the server, because these pages resolve
 * their locale there — swapping a context value client-side would translate
 * the live half of the page and leave whatever was already in the HTML behind.
 */
export default function LocaleSwitch({ persist = 'cookie' }: { persist?: 'cookie' | 'account' }) {
  const current = useLocale()
  const t = useT()
  const router = useRouter()
  const [pending, start] = useTransition()

  function pick(l: Locale) {
    if (l === current || pending) return
    if (persist === 'account') {
      start(async () => {
        await setUiLanguage(l)
        router.refresh()
      })
      return
    }
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
          disabled={pending}
          aria-pressed={l === current}
          className={l === current ? 'is-on' : undefined}
        >
          {LOCALE_NAMES[l]}
        </button>
      ))}
    </div>
  )
}
