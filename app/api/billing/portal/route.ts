import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { publicBase } from '@/lib/url'

export const dynamic = 'force-dynamic'

/**
 * Sends the teacher to Stripe's own billing portal.
 *
 * Cancelling, changing card, downloading invoices and switching plan all live
 * there rather than being rebuilt here — it is the one part of billing where
 * writing less code is strictly safer, because Stripe handles proration, tax
 * and dunning correctly and a hand-rolled version would not.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: 'Billing is not set up yet.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle()

  const customerId = (profile as any)?.stripe_customer_id as string | null
  if (!customerId) {
    // Nothing has ever been charged, so there is no portal to open. The panel
    // shows plan buttons in this state, not "manage billing".
    return NextResponse.json({ ok: false, error: 'No billing account yet — pick a plan first.' }, { status: 409 })
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${publicBase(req)}/settings#subscription`,
    })
    return NextResponse.json({ ok: true, url: session.url })
  } catch (e: any) {
    console.error('[billing/portal]', e?.message || e)
    return NextResponse.json({ ok: false, error: 'Could not open the billing portal.' }, { status: 500 })
  }
}
