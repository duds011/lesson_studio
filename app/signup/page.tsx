import I18nProvider from '@/components/I18nProvider'
import { publicLocale } from '@/lib/i18n/server'
import SignupForm from '@/components/auth/SignupForm'

/**
 * A server shell whose only job is to know the language.
 *
 * The form itself has to be a client component — it holds three inputs and
 * calls Supabase — but nobody is signed in here, so the locale has to be
 * resolved from the request (cookie, then Accept-Language) before any HTML
 * is written. Doing it in the page keeps that lookup on the server and lets
 * the form stay a plain client component that just calls useT().
 */
export const dynamic = 'force-dynamic'

export default async function SignupPage() {
  const locale = await publicLocale()
  return (
    <I18nProvider locale={locale}>
      <SignupForm />
    </I18nProvider>
  )
}
