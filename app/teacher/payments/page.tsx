import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCreditsByStudent } from '@/lib/credits'
import PaymentsManager, { ManagedPayment, StudentOption, Credit } from '@/components/portal/PaymentsManager'

export const dynamic = 'force-dynamic'

const TRIAL_ID = '__trial__'
const OTHER_ID = '__other__'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: students }, { data: payments }, { data: profile }, creditMap] = await Promise.all([
    supabase.from('students').select('id, full_name').eq('teacher_id', user.id).order('full_name'),
    supabase.from('payments').select('*').eq('teacher_id', user.id),
    supabase.from('profiles').select('currency').eq('id', user.id).single(),
    getCreditsByStudent(supabase, user.id),
  ])

  const currency = (profile as any)?.currency ?? 'USD'
  const nameById = new Map((students ?? []).map((s: any) => [s.id, s.full_name]))

  const managed: ManagedPayment[] = (payments ?? []).map((p: any) => ({
    id: p.id,
    studentId: p.student_id ?? (p.category === 'trial' ? TRIAL_ID : OTHER_ID),
    studentName: p.student_id ? (nameById.get(p.student_id) ?? 'Unknown') : (p.category === 'trial' ? 'Trial' : 'Other'),
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    description: p.description,
    lessons_covered: p.lessons_covered,
    payment_date: p.payment_date,
    due_date: p.due_date,
    method: p.method,
    created_at: p.created_at,
  }))

  const studentOptions: StudentOption[] = (students ?? []).map((s: any) => ({ id: s.id, fullName: s.full_name }))
  const credits: Record<string, Credit> = {}
  for (const s of studentOptions) credits[s.id] = creditMap.get(s.id) ?? { purchased: 0, used: 0, remaining: 0, low: true }

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div>
        <span className="eyebrow">Teacher</span>
        <h1 className="title" style={{ margin: '6px 0 4px' }}>Payments</h1>
        <p className="sub">All student payments in one place — track revenue, lesson packages, and who&rsquo;s running low.</p>
      </div>
      <PaymentsManager students={studentOptions} credits={credits} payments={managed} currency={currency} />
    </div>
  )
}
