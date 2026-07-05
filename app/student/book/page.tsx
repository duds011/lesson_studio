import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStudentCredits } from '@/lib/credits'
import BookingCalendar from '@/components/portal/BookingCalendar'

export const dynamic = 'force-dynamic'

export default async function StudentBookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: student } = await admin.from('students').select('id').eq('profile_id', user.id).single()
  const credits = student ? await getStudentCredits(admin, student.id) : { purchased: 0, used: 0, remaining: 0, low: true }
  const hasPkg = credits.purchased > 0 || credits.used > 0

  return <BookingCalendar remaining={hasPkg ? credits.remaining : null} />
}
