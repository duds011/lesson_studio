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

  /**
   * Make this teacher a Stripe Customer and remember which one.
   *
   * Separated out because it is now reached from two places: the first time a
   * teacher buys anything, and again if the id we stored turns out to point at
   * nothing.
   */
  const mintCustomer = async (): Promise<string> => {
    const customer = await stripe.customers.create({
      email: (profile as any).email ?? user.email ?? undefined,
      name: (profile as any).full_name ?? undefined,
      metadata: { teacher_id: user.id },
    })
    const { error } = await admin
      .from('profiles').update({ stripe_customer_id: customer.id }).eq('id', user.id)
    // If this write fails we would mint a second customer next time, which
    // splits their billing history — better to stop than to paper over it.
    if (error) throw new Error(`Could not save the Stripe customer: ${error.message}`)
    return customer.id
  }

  try {
    // One Stripe Customer per teacher, reused forever, so the billing portal
    // and every future invoice hang off the same record.
    let customerId =
      ((profile as any).stripe_customer_id as string | null) || (await mintCustomer())

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

    const openSession = (customer: string) =>
      stripe.checkout.sessions.create({
        // A payment, never a subscription. Nothing here renews.
        mode: 'payment',
        currency,
        customer,
        line_items: [{ price: price.id, quantity: 1 }],
        allow_promotion_codes: true,
        client_reference_id: user.id,
        /**
         * The price on the site is the price on the Stripe page.
         *
         * Stripe Tax is active on the account and its default behaviour is
         * "exclusive" — VAT added on top of the figure we quote. These prices
         * are rounded by hand against a fixed FX table precisely so that a
         * teacher sees one number and pays it. Disabled here rather than in
         * the dashboard so a settings change can never quietly reprice us.
         */
        automatic_tax: { enabled: false },
        /**
         * Same promise, different mechanism. Adaptive Pricing converts into
         * the buyer's local currency at Stripe's live rate, which would quote
         * a fourth number next to our three hand-rounded lists.
         */
        adaptive_pricing: { enabled: false },
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

    /**
     * A customer id we stored ourselves can still point at nothing.
     *
     * Stripe keeps test and live data in separate worlds, so every customer
     * minted while the keys were sk_test_ is a dead id the moment the keys go
     * live — and the profile row holding it looks perfectly valid. The same
     * happens to anyone deleted from the dashboard. Failing here would mean a
     * teacher can never buy anything again because of a pointer we wrote, so
     * mint a fresh customer and carry on. They see a checkout page, not an
     * error.
     */
    let session
    try {
      session = await openSession(customerId)
    } catch (e: any) {
      const missingCustomer =
        e?.code === 'resource_missing' &&
        (e?.param === 'customer' || /customer/i.test(String(e?.message ?? '')))
      if (!missingCustomer) throw e
      customerId = await mintCustomer()
      session = await openSession(customerId)
    }

    return NextResponse.json({ ok: true, url: session.url })
  } catch (e: any) {
    console.error('[billing/checkout]', e?.message || e)
    return NextResponse.json({ ok: false, error: 'Could not start checkout.' }, { status: 500 })
  }
}
