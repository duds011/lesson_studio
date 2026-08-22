import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { publicBase } from '@/lib/url'
import { PLANS, TOPUP, isPurchasable } from '@/lib/plans'

export const dynamic = 'force-dynamic'

/**
 * Starts checkout for the teacher's OWN Lesson Studio subscription.
 *
 * Not to be confused with /api/stripe/checkout, which sells lesson packages on
 * the teacher's CONNECTED account — that is the teacher being paid. This is the
 * teacher paying us, so it runs on the platform account with no stripeAccount
 * option anywhere in it.
 *
 * Two shapes: a plan id starts a subscription, `topup` buys one bundle of extra
 * recaps. Both land on the same webhook.
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
    .from('profiles')
    .select('id, role, email, full_name, stripe_customer_id, recap_monthly_limit')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || (profile as any).role !== 'teacher') {
    return NextResponse.json({ ok: false, error: 'Only a teacher account can subscribe.' }, { status: 403 })
  }

  const { planId, topup } = await req.json().catch(() => ({}))

  // A top-up is meaningless without an allowance to sit behind — the quota
  // check never spends credits on a trial account.
  if (topup && (profile as any).recap_monthly_limit == null) {
    return NextResponse.json(
      { ok: false, error: 'Pick a plan first — top-ups are only spent after a monthly allowance.' },
      { status: 409 },
    )
  }
  if (!topup && !isPurchasable(planId)) {
    return NextResponse.json({ ok: false, error: 'Unknown plan.' }, { status: 400 })
  }

  const stripe = getStripe()
  const base = publicBase(req)

  try {
    // One Stripe Customer per teacher, reused forever, so the billing portal
    // and every future invoice hang off the same record.
    let customerId = (profile as any).stripe_customer_id as string | null
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: (profile as any).email ?? user.email ?? undefined,
        name: (profile as any).full_name ?? undefined,
        metadata: { teacher_id: user.id },
      })
      customerId = customer.id
      const { error } = await admin
        .from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
      // If this write fails we would mint a second customer next time, which
      // splits their billing history — better to stop than to paper over it.
      if (error) throw new Error(`Could not save the Stripe customer: ${error.message}`)
    }

    const lookupKey = topup ? TOPUP.lookupKey : PLANS.find((p) => p.id === planId)!.lookupKey
    const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 })
    const price = prices.data[0]
    if (!price) {
      // Means scripts/stripe-setup.mjs has not been run against this Stripe
      // account (or was run in the other mode). Say which key is missing.
      return NextResponse.json(
        { ok: false, error: `Billing is not finished setting up (missing price "${lookupKey}").` },
        { status: 503 },
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: topup ? 'payment' : 'subscription',
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: {
        teacher_id: user.id,
        kind: topup ? 'topup' : 'subscription',
        plan_id: topup ? '' : String(planId),
        topup_recaps: topup ? String(TOPUP.recaps) : '',
      },
      // Subscription metadata rides on the subscription itself too, so a later
      // customer.subscription.updated can be resolved without the session.
      ...(topup
        ? {}
        : { subscription_data: { metadata: { teacher_id: user.id, plan_id: String(planId) } } }),
      success_url: `${base}/settings?billing=success#subscription`,
      cancel_url: `${base}/settings?billing=cancelled#subscription`,
    })

    return NextResponse.json({ ok: true, url: session.url })
  } catch (e: any) {
    console.error('[billing/checkout]', e?.message || e)
    return NextResponse.json({ ok: false, error: 'Could not start checkout.' }, { status: 500 })
  }
}
