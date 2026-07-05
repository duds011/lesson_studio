import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { publicBase } from '@/lib/url'

export const dynamic = 'force-dynamic'

// Teacher returns from Stripe onboarding. Re-read the account and cache whether
// it can accept charges, then send them back to Payments.
export async function GET(req: NextRequest) {
  const base = publicBase(req)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${base}/login`)

  const { data: profile } = await supabase.from('profiles').select('stripe_account_id').eq('id', user.id).single()
  const accountId = profile?.stripe_account_id as string | null
  if (!accountId) return NextResponse.redirect(`${base}/teacher/payments?stripe=error`)

  try {
    const account = await getStripe().accounts.retrieve(accountId)
    const enabled = Boolean(account.charges_enabled)
    await supabase.from('profiles').update({ stripe_charges_enabled: enabled }).eq('id', user.id)
    return NextResponse.redirect(`${base}/teacher/payments?stripe=${enabled ? 'connected' : 'incomplete'}`)
  } catch (e: any) {
    console.error('Stripe connect return failed:', e?.message || e)
    return NextResponse.redirect(`${base}/teacher/payments?stripe=error`)
  }
}
