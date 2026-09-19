'use client'

import { createContext, useContext, useEffect } from 'react'
import { DEFAULT_LOCALE, getDict, type Locale, type Messages } from '@/lib/i18n'

/**
 * The resolved locale, handed down to client components.
 *
 * The marketing site threads `locale` as a prop instead, because it is a
 * static export where half the tree renders on the server and a context
 * would have forced all of it to the client. This app has the opposite
 * shape — every page is force-dynamic and 71 of its 112 components are
 * already client components — so a context costs nothing and saves adding a
 * prop to a hundred call sites, most of which would only be passing it
 * through to something else.
 *
 * Server components do NOT use this. They take the locale from
 * lib/i18n/server and call getDict directly, which is the same lookup; there
 * is deliberately no separate client path for the copy itself, only for how
 * the locale arrives.
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export default function I18nProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  /**
   * Keep <html lang> honest.
   *
   * The root layout cannot set it: it renders for signed-out pages too and
   * does not know whether this request belongs to a teacher, a student, or
   * nobody — finding out would mean a database read on every page load just
   * to fill one attribute. Setting it after mount costs nothing, cannot
   * cause a hydration mismatch, and is what screen readers and the browser's
   * own "translate this page?" prompt actually read.
   */
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
}

export function useLocale(): Locale {
  return useContext(LocaleContext)
}

/**
 * The copy, for a client component.
 *
 * Named `useT` because every call site reads `const t = useT()` and then
 * `t.nav.settings`, which is short enough that nobody is tempted to hoist the
 * string into a constant and lose the translation.
 *
 * Outside a provider this returns English rather than throwing. A missing
 * provider should show up as untranslated text on one branch of the app, not
 * as a white screen.
 */
export function useT(): Messages {
  return getDict(useContext(LocaleContext))
}
