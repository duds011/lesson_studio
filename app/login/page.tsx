import { Suspense } from 'react'
import I18nProvider from '@/components/I18nProvider'
import { publicLocale } from '@/lib/i18n/server'
import LoginForm from '@/components/auth/LoginForm'

/**
 * A server shell whose only job is to know the language.
 *
 * Nobody is signed in here, so the locale comes from the request — the
 * cookie a visitor set with the switcher, then Accept-Language — and it has
 * to be resolved before any HTML is written or the page arrives in English
 * and flips.
 *
 * The Suspense boundary is for useSearchParams inside the form (`?next=`,
 * `?expired=1`), which Next requires when the page above it is a server
 * component.
 */
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const locale = await publicLocale()
  return (
    <I18nProvider locale={locale}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </I18nProvider>
  )
}
