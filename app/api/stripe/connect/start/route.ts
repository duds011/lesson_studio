import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { publicBase } from '@/lib/url'

export const dynamic = 'force-dynamic'

// Teacher clicks "Connect Stripe" → we get-or-create their Express connected
// account, then redirect them to Stripe's hosted onboarding.
export async function GET(req: NextRequest) {
  const base = publicBase(req)
  if (!isStripeConfigured()) return NextResponse.redirect(`${base}/teacher/payments?stripe=unconfigured`)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(`${base}/login`)

  const { data: profile } = await supabase.from('profiles').select('role, email, stripe_account_id').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return NextResponse.redirect(`${base}/`)

  const stripe = getStripe()
  let accountId = profile?.stripe_account_id as string | null

  try {
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: profile?.email ?? user.email ?? undefined,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        metadata: { teacher_id: user.id },
      })
      accountId = account.id
      await supabase.from('profiles').update({ stripe_account_id: accountId }).eq('id', user.id)
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${base}/api/stripe/connect/start`,
      return_url: `${base}/api/stripe/connect/return`,
      type: 'account_onboarding',
    })
    return NextResponse.redirect(link.url)
  } catch (e: any) {
    console.error('Stripe connect start failed:', e?.message || e)
    return NextResponse.redirect(`${base}/teacher/payments?stripe=error`)
  }
}
