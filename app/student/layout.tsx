import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { brandVars, resolveBrand } from '@/lib/brand'
import StudentRail from '@/components/koku/StudentRail'

export const dynamic = 'force-dynamic'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // The student's teacher owns the branding. Read it with admin so this works
  // even if the RLS policy hasn't been applied to a given environment yet.
  const admin = createAdminClient()
  const { data: student } = await admin.from('students').select('teacher_id').eq('profile_id', user.id).single()
  const { data: teacher } = student
    ? await admin.from('profiles').select('brand').eq('id', student.teacher_id).single()
    : { data: null }

  const brand = resolveBrand((teacher as any)?.brand)

  return (
    <div className="k-shell" style={brandVars(brand)}>
      <StudentRail mark={brand.logoText} />
      <main className="k-main page-fade">{children}</main>
    </div>
  )
}
