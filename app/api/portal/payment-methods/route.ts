import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTeacherPaymentMethods } from '@/lib/payment-methods'

export const dynamic = 'force-dynamic'

// Returns the logged-in student's teacher's payment methods. Read via admin
// (students can't read the teacher profile row under RLS) after authenticating.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, methods: [] }, { status: 401 })

  const admin = createAdminClient()
  const { data: student } = await admin.from('students').select('teacher_id').eq('profile_id', user.id).single()
  if (!student) return NextResponse.json({ ok: false, methods: [] }, { status: 403 })

  const methods = await getTeacherPaymentMethods(admin, student.teacher_id)
  return NextResponse.json({ ok: true, methods })
}
