import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { backgroundClass, brandVars, resolveBrand } from '@/lib/brand'
import StudentTopBar from '@/components/koku/StudentTopBar'
import I18nProvider from '@/components/I18nProvider'
import { studentLocale } from '@/lib/i18n/server'

export const dynamic = 'force-dynamic'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = await requireUser(supabase, '/student/dashboard')

  // The student's teacher owns the branding. Read it with admin so this works
  // even if the RLS policy hasn't been applied to a given environment yet.
  const admin = createAdminClient()
  const { data: student } = await admin.from('students').select('teacher_id').eq('profile_id', user.id).single()
  const { data: teacher } = student
    ? await admin.from('profiles').select('brand').eq('id', student.teacher_id).single()
    : { data: null }

  const brand = resolveBrand((teacher as any)?.brand)

  // Follows students.instruction_language — the language they already told us
  // they read most comfortably. See lib/i18n/server.
  const locale = await studentLocale(admin, user.id)

  return (
    <I18nProvider locale={locale}>
      <div className={`k-shell solo ${backgroundClass(brand)}`} style={brandVars(brand)}>
        <main className="k-main page-fade">
          <StudentTopBar mark={brand.logoText} name={brand.portalName} />
          {children}
        </main>
      </div>
    </I18nProvider>
  )
}
