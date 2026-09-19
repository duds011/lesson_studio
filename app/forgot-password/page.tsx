import I18nProvider from '@/components/I18nProvider'
import { publicLocale } from '@/lib/i18n/server'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

/** Signed out by definition — the locale comes from the request. */
export const dynamic = 'force-dynamic'

export default async function ForgotPasswordPage() {
  const locale = await publicLocale()
  return (
    <I18nProvider locale={locale}>
      <ForgotPasswordForm />
    </I18nProvider>
  )
}
