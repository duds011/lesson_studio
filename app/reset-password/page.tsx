import { Suspense } from 'react'
import I18nProvider from '@/components/I18nProvider'
import { publicLocale } from '@/lib/i18n/server'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

/** Signed out by definition — the locale comes from the request. */
export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage() {
  const locale = await publicLocale()
  return (
    <I18nProvider locale={locale}>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </I18nProvider>
  )
}
