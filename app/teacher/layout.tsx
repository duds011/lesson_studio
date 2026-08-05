import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getToken } from '@/lib/store'
import { resolveCalendarMode } from '@/lib/calendar-mode'
import AppNav from '@/components/AppNav'

export const dynamic = 'force-dynamic'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, calendar_mode').eq('id', user.id).single()
  if (profile?.role !== 'teacher') redirect('/student/dashboard')

  // The sidebar told every teacher "Calendar connected" regardless. It now
  // reports what is actually true, and drops the calendar-only links for a
  // teacher who told onboarding they keep no calendar.
  const token = await getToken()
  const calendar = resolveCalendarMode((profile as any).calendar_mode) !== 'none'

  return (
    <>
      <AppNav email={user.email} connected={Boolean(token)} calendar={calendar} />
      <main className="wrap page-fade">{children}</main>
    </>
  )
}
