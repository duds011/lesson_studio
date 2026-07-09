import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCreditsByStudent } from '@/lib/credits'
import { normalizeMethods } from '@/lib/payment-methods'
import PaymentsManager, { ManagedPayment, StudentOption, Credit } from '@/components/portal/PaymentsManager'
import PaymentMethodsManager from '@/components/portal/PaymentMethodsManager'
import StripeManager, { Pkg } from '@/components/portal/StripeManager'

export const dynamic = 'force-dynamic'

const TRIAL_ID = '__trial__'
const OTHER_ID = '__other__'

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ stripe?: string }> }) {
  const { stripe: stripeStatus } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: students }, { data: payments }, { data: profile }, { data: pkgRows }, creditMap] = await Promise.all([
    supabase.from('students').select('id, full_name').eq('teacher_id', user.id).order('full_name'),
    supabase.from('payments').select('*').eq('teacher_id', user.id),
    supabase.from('profiles').select('currency, payment_methods, stripe_account_id, stripe_charges_enabled').eq('id', user.id).single(),
    supabase.from('lesson_packages').select('*').eq('teacher_id', user.id).order('created_at', { ascending: true }),
    getCreditsByStudent(supabase, user.id),
  ])

  const currency = (profile as any)?.currency ?? 'USD'
  const paymentMethods = normalizeMethods((profile as any)?.payment_methods)
  const stripeConnected = Boolean((profile as any)?.stripe_account_id)
  const chargesEnabled = Boolean((profile as any)?.stripe_charges_enabled)
  const packages: Pkg[] = (pkgRows ?? []).map((p: any) => ({ id: p.id, name: p.name, lessons_count: p.lessons_count, amount: Number(p.amount), currency: p.currency, active: p.active }))
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

      {/* Card payments (Stripe) — coming soon */}
      <div className="analytics-card" style={{ padding: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0 }}>💳 Card payments</h3>
            <span className="pill" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>Coming soon</span>
          </div>
          <p className="sub" style={{ margin: '6px 0 0', maxWidth: 520 }}>Sell lesson packages and take card payments with automatic payouts. For now, record payments manually above and share your payment details below.</p>
        </div>
      </div>

      <PaymentMethodsManager initial={paymentMethods} />
    </div>
  )
}
