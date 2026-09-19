import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { publicBase } from '@/lib/url'
import { PACKS, packById, isPurchasable } from '@/lib/plans'
import { asPackCurrency } from '@/lib/pack-currency'

export const dynamic = 'force-dynamic'

/**
 * Starts checkout for a pack of write-ups — the teacher paying us.
 *
 * This is the teacher paying us, so it runs on the platform account with no
 * stripeAccount option anywhere in it. (Stripe Connect — the teacher being
 * paid — was removed as an unreachable feature; /api/stripe/webhook remains
 * for its historical events.)
 *
 * One shape now: a pack id buys a fixed number of write-ups, once. There is no
 * subscription to start, nothing renews, and nothing expires — so there is no
 * second branch and no billing portal to send anyone to.
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
    .select('id, role, email, full_name, stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || (profile as any).role !== 'teacher') {
    return NextResponse.json({ ok: false, error: 'Only a teacher account can buy write-ups.' }, { status: 403 })
  }

  const { packId, currency: wanted } = await req.json().catch(() => ({}))
  if (!isPurchasable(packId)) {
    return NextResponse.json({ ok: false, error: 'Unknown pack.' }, { status: 400 })
  }
  const pack = packById(packId)!

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

    const lookupKey = pack.lookupKey
    const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 })
    const price = prices.data[0]
    if (!price) {
      // Means scripts/stripe-packs.mjs has not been run against this Stripe
      // account (or was run in the other mode). Say which key is missing.
      return NextResponse.json(
        { ok: false, error: `Billing is not finished setting up (missing price "${lookupKey}").` },
        { status: 503 },
      )
    }

    /**
     * The currency the teacher was quoted, not one Stripe guesses.
     *
     * The Price carries all three amounts as currency_options, so naming the
     * currency here picks the one we published rather than converting the
     * dollar figure. It comes from the browser's time zone, which is also what
     * the website used to print the price — so the number on the card and the
     * number on Stripe's page are the same number.
     *
     * Unrecognised input falls back to dollars rather than failing: a teacher
     * in the middle of paying should not be stopped by a currency we do not
     * recognise.
     */
    const currency = asPackCurrency(wanted).toLowerCase()

    const session = await stripe.checkout.sessions.create({
      // A payment, never a subscription. Nothing here renews.
      mode: 'payment',
      currency,
      customer: customerId,
      line_items: [{ price: price.id, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: user.id,
      /**
       * The COUNT rides on the session, not just the pack id.
       *
       * The webhook is what grants the write-ups, and it should not have to
       * trust that this deployment's lib/plans still says what it said when
       * the session was made. If a pack is ever resized, someone who paid
       * yesterday gets what they paid for.
       */
      metadata: {
        teacher_id: user.id,
        kind: 'pack',
        pack_id: pack.id,
        pack_recaps: String(pack.recaps),
      },
      success_url: `${base}/teacher/recaps?billing=success`,
      cancel_url: `${base}/teacher/recaps?billing=cancelled`,
    })

    return NextResponse.json({ ok: true, url: session.url })
  } catch (e: any) {
    console.error('[billing/checkout]', e?.message || e)
    return NextResponse.json({ ok: false, error: 'Could not start checkout.' }, { status: 500 })
  }
}
