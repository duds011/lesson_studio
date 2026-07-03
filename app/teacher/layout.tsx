import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PortalNav from '@/components/portal/PortalNav'

export const dynamic = 'force-dynamic'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') redirect('/student/dashboard')

  return (
    <>
      <PortalNav
        brand="Lesson Studio · Teacher"
        email={user.email ?? ''}
        links={[{ href: '/teacher/dashboard', label: 'Students' }]}
      />
      <main className="main-wrap page-fade">{children}</main>
    </>
  )
}
