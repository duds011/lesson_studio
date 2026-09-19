import { Suspense } from 'react'
import I18nProvider from '@/components/I18nProvider'
import { publicLocale } from '@/lib/i18n/server'
import BookForm from '@/components/auth/BookForm'

/**
 * A server shell that knows the language.
 *
 * Nobody is signed in on a booking link — it goes to a student who may not
 * have an account at all — so the locale comes from the request, the same
 * way login and signup resolve theirs.
 */
export const dynamic = 'force-dynamic'

export default async function BookPage() {
  const locale = await publicLocale()
  return (
    <I18nProvider locale={locale}>
      <Suspense>
        <BookForm />
      </Suspense>
    </I18nProvider>
  )
}
