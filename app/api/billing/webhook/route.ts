import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'
import { packById } from '@/lib/plans'

export const dynamic = 'force-dynamic'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

/**
 * Platform billing webhook — the teacher buying write-ups.
 *
 * Deliberately NOT the same endpoint as /api/stripe/webhook. That one is the
 * Connect endpoint, listening for students paying teachers, and it is verified
 * with its own signing secret. Two endpoints means two secrets, and a
 * misconfigured one fails closed instead of silently processing the other
 * account's events.
 *
 * This route is the only thing that grants entitlement. recap_credits is never
 * written from the browser — a teacher can start a checkout, but only Stripe
 * telling us it was paid adds anything to their balance.
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

        /**
         * The count comes from the session, not from today's lib/plans.
         *
         * Someone who paid for a 50-pack gets 50, even if the pack has since
         * been resized. The pack id is only a fallback for a session written
         * before the count rode along.
         */
        const fromSession = Number(s.metadata?.pack_recaps)
        const pack = packById(s.metadata?.pack_id)
        const add = Number.isFinite(fromSession) && fromSession > 0 ? fromSession : (pack?.recaps ?? 0)
        if (add <= 0) {
          console.error(`[billing] paid session ${s.id} carried no pack size`)
          break
        }

        // Added in SQL rather than read-then-write: two purchases seconds
        // apart would otherwise both read the same balance and one would
        // vanish. Idempotency is already handled by the billing_events claim
        // above; this guards concurrency, which is a different problem.
        const { error } = await admin.rpc('add_recap_credits', { teacher: teacherId, amount: add })
        if (error) throw new Error(`could not add credits: ${error.message}`)

        // plan_id stops meaning a tier and becomes "the last thing they
        // bought" — which is also how the quota knows they are no longer on
        // their opening free balance.
        await admin
          .from('profiles')
          .update({ plan_id: pack?.id ?? 'pack', subscription_status: null, stripe_subscription_id: null })
          .eq('id', teacherId)

        console.log(`[billing] +${add} write-ups for ${teacherId} (${pack?.id ?? 'unknown pack'})`)
        await admin.from('billing_events').update({ teacher_id: teacherId }).eq('event_id', event.id)
        break
      }

      /**
       * Nothing renews any more, so the subscription events are gone.
       *
       * They are not merely unused: leaving them in would mean a stray event
       * from the old subscriptions — or a retry of one — could still write
       * recap_monthly_limit on a column nothing reads, or clear a balance a
       * teacher paid for. Unhandled is the safe state.
       */
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

