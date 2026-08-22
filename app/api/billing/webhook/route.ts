import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { planById, planByLookupKey, TOPUP } from '@/lib/plans'

export const dynamic = 'force-dynamic'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

/**
 * Platform billing webhook — the teacher's own subscription.
 *
 * Deliberately NOT the same endpoint as /api/stripe/webhook. That one is the
 * Connect endpoint, listening for students paying teachers, and it is verified
 * with its own signing secret. Two endpoints means two secrets, and a
 * misconfigured one fails closed instead of silently processing the other
 * account's events.
 *
 * This route is the only thing that grants entitlement. recap_monthly_limit is
 * never written from the browser — the teacher can start a checkout, but only
 * Stripe telling us it was paid actually changes what they can do.
 */
export async function POST(req: NextRequest) {
  const secret = clean(process.env.STRIPE_BILLING_WEBHOOK_SECRET)
  const sig = req.headers.get('stripe-signature')
  if (!secret || !sig) {
    return NextResponse.json({ ok: false, error: 'Webhook not configured.' }, { status: 400 })
  }

  const raw = await req.text()
  let event
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret)
  } catch (e: any) {
    console.error('[billing/webhook] signature failed:', e?.message || e)
    return NextResponse.json({ ok: false, error: 'Invalid signature.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotency, claimed BEFORE any work. Stripe retries on timeout, and the
  // top-up branch adds credits — replaying it would hand out free recaps.
  // The primary key makes the second insert fail, which is the lock.
  const { error: claimError } = await admin
    .from('billing_events')
    .insert({ event_id: event.id, type: event.type })
  if (claimError) {
    // 23505 = unique violation: already handled, so this is a retry.
    if ((claimError as any).code === '23505') return NextResponse.json({ received: true, duplicate: true })
    console.error('[billing/webhook] could not claim event:', claimError.message)
    // Fail loudly so Stripe retries rather than dropping the event.
    return NextResponse.json({ ok: false, error: 'Could not record event.' }, { status: 500 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as any
        const teacherId = s.metadata?.teacher_id || s.client_reference_id
        if (!teacherId) break

        if (s.metadata?.kind === 'topup') {
          const add = Number(s.metadata?.topup_recaps || TOPUP.recaps)
          const { data: p } = await admin
            .from('profiles').select('recap_topup_credits').eq('id', teacherId).maybeSingle()
          const current = Number((p as any)?.recap_topup_credits ?? 0)
          await admin
            .from('profiles')
            .update({ recap_topup_credits: current + add })
            .eq('id', teacherId)
          console.log(`[billing] +${add} top-up recaps for ${teacherId}`)
        } else {
          // The subscription events below carry the authoritative price, so
          // this only records who and what — the allowance is set there too,
          // and setting it here as well means the teacher is not left waiting
          // on event ordering to start using what they just bought.
          const plan = planById(s.metadata?.plan_id)
          await admin
            .from('profiles')
            .update({
              plan_id: plan?.id ?? null,
              recap_monthly_limit: plan?.recaps ?? null,
              stripe_subscription_id: s.subscription ?? null,
              subscription_status: 'active',
            })
            .eq('id', teacherId)
          console.log(`[billing] ${teacherId} subscribed to ${plan?.id ?? 'unknown'}`)
        }
        await admin.from('billing_events').update({ teacher_id: teacherId }).eq('event_id', event.id)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as any
        const teacherId = await resolveTeacher(admin, sub)
        if (!teacherId) break

        // The price actually being billed decides the allowance — not what the
        // checkout said it would be. A plan switch inside Stripe's portal
        // arrives here and nowhere else.
        const lookupKey = sub.items?.data?.[0]?.price?.lookup_key
        const plan = planByLookupKey(lookupKey) ?? planById(sub.metadata?.plan_id)

        // Only a subscription that is actually paying grants recaps. past_due
        // keeps the allowance (Stripe is still retrying the card); unpaid and
        // canceled do not.
        const status = String(sub.status || '')
        const entitled = status === 'active' || status === 'trialing' || status === 'past_due'

        await admin
          .from('profiles')
          .update({
            plan_id: plan?.id ?? null,
            recap_monthly_limit: entitled && plan ? plan.recaps : null,
            stripe_subscription_id: sub.id,
            subscription_status: status,
          })
          .eq('id', teacherId)
        console.log(`[billing] ${teacherId} → ${plan?.id ?? 'none'} (${status})`)
        await admin.from('billing_events').update({ teacher_id: teacherId }).eq('event_id', event.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any
        const teacherId = await resolveTeacher(admin, sub)
        if (!teacherId) break
        // Back to no allowance. Top-up credits are deliberately left alone —
        // they were paid for separately and never expire.
        await admin
          .from('profiles')
          .update({
            plan_id: null,
            recap_monthly_limit: null,
            stripe_subscription_id: null,
            subscription_status: 'canceled',
          })
          .eq('id', teacherId)
        console.log(`[billing] ${teacherId} cancelled`)
        await admin.from('billing_events').update({ teacher_id: teacherId }).eq('event_id', event.id)
        break
      }

      default:
        break
    }
  } catch (e: any) {
    console.error(`[billing/webhook] ${event.type} failed:`, e?.message || e)
    // Release the claim so Stripe's retry can have another go — otherwise a
    // transient database error would be remembered as "handled".
    await admin.from('billing_events').delete().eq('event_id', event.id)
    return NextResponse.json({ ok: false, error: 'Handler failed.' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

/** Who a subscription belongs to: its own metadata first, then the customer. */
async function resolveTeacher(admin: any, sub: any): Promise<string | null> {
  if (sub?.metadata?.teacher_id) return String(sub.metadata.teacher_id)
  const customerId = typeof sub?.customer === 'string' ? sub.customer : sub?.customer?.id
  if (!customerId) return null
  const { data } = await admin
    .from('profiles').select('id').eq('stripe_customer_id', customerId).maybeSingle()
  return (data as any)?.id ?? null
}
