import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentRail from '@/components/koku/StudentRail'

export const dynamic = 'force-dynamic'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="k-shell">
      <StudentRail />
      <main className="k-main page-fade">{children}</main>
    </div>
  )
}
