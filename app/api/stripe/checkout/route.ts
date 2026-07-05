import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe, isStripeConfigured, toStripeAmount } from '@/lib/stripe'
import { publicBase } from '@/lib/url'

export const dynamic = 'force-dynamic'

// Creates a Stripe Checkout Session on the teacher's connected account for a
// lesson package. Callable by the teacher (to generate a link for a student)
// or by the student (self-serve). Returns { url } to redirect/share.
export async function POST(req: NextRequest) {
  const base = publicBase(req)
  if (!isStripeConfigured()) return NextResponse.json({ ok: false, error: 'Stripe not configured.' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })

  const { packageId, studentId: bodyStudentId } = await req.json().catch(() => ({}))
  if (!packageId) return NextResponse.json({ ok: false, error: 'Missing package.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  // Resolve teacher, student, and the package depending on who is buying.
  let teacherId: string
  let studentId: string
  if (profile?.role === 'teacher') {
    if (!bodyStudentId) return NextResponse.json({ ok: false, error: 'Select a student.' }, { status: 400 })
    const { data: s } = await supabase.from('students').select('id, teacher_id').eq('id', bodyStudentId).single()
    if (!s || s.teacher_id !== user.id) return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 })
    teacherId = user.id; studentId = s.id
  } else {
    const { data: s } = await admin.from('students').select('id, teacher_id').eq('profile_id', user.id).single()
    if (!s) return NextResponse.json({ ok: false, error: 'No student profile linked.' }, { status: 403 })
    teacherId = s.teacher_id; studentId = s.id
  }

  const { data: pkg } = await admin.from('lesson_packages').select('*').eq('id', packageId).eq('teacher_id', teacherId).single()
  if (!pkg || !pkg.active) return NextResponse.json({ ok: false, error: 'Package unavailable.' }, { status: 404 })

  const { data: teacher } = await admin.from('profiles').select('stripe_account_id, stripe_charges_enabled').eq('id', teacherId).single()
  if (!teacher?.stripe_account_id || !teacher.stripe_charges_enabled) {
    return NextResponse.json({ ok: false, error: 'Your teacher hasn’t finished connecting Stripe yet.' }, { status: 409 })
  }

  const { data: student } = await admin.from('students').select('full_name, email').eq('id', studentId).single()
  const currency = String(pkg.currency || 'USD').toLowerCase()

  try {
    const session = await getStripe().checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [{
          quantity: 1,
          price_data: {
            currency,
            unit_amount: toStripeAmount(Number(pkg.amount), pkg.currency),
            product_data: { name: pkg.name, description: `${pkg.lessons_count} lesson${pkg.lessons_count === 1 ? '' : 's'}` },
          },
        }],
        customer_email: student?.email || undefined,
        metadata: {
          teacher_id: teacherId,
          student_id: studentId,
          package_id: pkg.id,
          package_name: pkg.name,
          lessons_covered: String(pkg.lessons_count),
        },
        success_url: `${base}/student/dashboard?purchase=success`,
        cancel_url: `${base}/student/dashboard?purchase=cancelled`,
      },
      { stripeAccount: teacher.stripe_account_id },
    )
    return NextResponse.json({ ok: true, url: session.url })
  } catch (e: any) {
    console.error('Stripe checkout failed:', e?.message || e)
    return NextResponse.json({ ok: false, error: 'Could not start checkout.' }, { status: 500 })
  }
}
