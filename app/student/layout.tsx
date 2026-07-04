import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PortalNav from '@/components/portal/PortalNav'

export const dynamic = 'force-dynamic'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <>
      <PortalNav
        brand="Lesson Studio"
        email={user.email ?? ''}
        links={[
          { href: '/student/dashboard', label: 'Dashboard' },
          { href: '/student/book', label: 'Book a lesson' },
        ]}
      />
      <main className="main-wrap page-fade">{children}</main>
    </>
  )
}
