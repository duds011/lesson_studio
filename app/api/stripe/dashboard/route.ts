import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { publicBase } from '@/lib/url'

export const dynamic = 'force-dynamic'

// Opens the teacher's Stripe Express dashboard, where they can see their
// balance and pay out to their bank account (incl. instant payout if eligible).
export async function GET(req: NextRequest) {
  const base = publicBase(req)
  if (!isStripeConfigured()) return NextResponse.redirect(`${base}/teacher/payments?stripe=unconfigured`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${base}/login`)

  const { data: profile } = await supabase.from('profiles').select('role, stripe_account_id, stripe_charges_enabled').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return NextResponse.redirect(`${base}/`)

  const accountId = (profile as any)?.stripe_account_id as string | null
  if (!accountId || !(profile as any)?.stripe_charges_enabled) {
    return NextResponse.redirect(`${base}/api/stripe/connect/start`)
  }

  try {
    const link = await getStripe().accounts.createLoginLink(accountId)
    return NextResponse.redirect(link.url)
  } catch (e: any) {
    console.error('Stripe dashboard link failed:', e?.message || e)
    return NextResponse.redirect(`${base}/teacher/payments?stripe=error`)
  }
}
