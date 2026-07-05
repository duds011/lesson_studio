import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe, fromStripeAmount } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

// Stripe webhook (Connect endpoint). On checkout.session.completed we record a
// paid `payments` row for the teacher → the existing credit math tops up the
// student's remaining lessons. Idempotent on the Checkout Session id.
export async function POST(req: NextRequest) {
  const secret = clean(process.env.STRIPE_WEBHOOK_SECRET)
  const sig = req.headers.get('stripe-signature')
  if (!secret || !sig) return NextResponse.json({ ok: false, error: 'Webhook not configured.' }, { status: 400 })

  const raw = await req.text()
  let event
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret)
  } catch (e: any) {
    console.error('Stripe webhook signature failed:', e?.message || e)
    return NextResponse.json({ ok: false, error: 'Invalid signature.' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as any
  if (session.payment_status !== 'paid') return NextResponse.json({ received: true })

  const meta = session.metadata || {}
  const teacherId = meta.teacher_id
  const studentId = meta.student_id
  const lessons = meta.lessons_covered ? parseInt(meta.lessons_covered, 10) : null
  if (!teacherId || !studentId) {
    console.error('Stripe webhook missing metadata', session.id)
    return NextResponse.json({ received: true })
  }

  const admin = createAdminClient()

  // Idempotency: skip if we already recorded this session.
  const { data: existing } = await admin.from('payments').select('id').eq('stripe_session_id', session.id).maybeSingle()
  if (existing) return NextResponse.json({ received: true, duplicate: true })

  const currency = String(session.currency || 'usd').toUpperCase()
  const amount = fromStripeAmount(Number(session.amount_total ?? 0), currency)

  const { error } = await admin.from('payments').insert({
    teacher_id: teacherId,
    student_id: studentId,
    amount,
    currency,
    status: 'paid',
    category: 'student',
    source: 'stripe',
    stripe_session_id: session.id,
    description: meta.package_name || 'Lesson package',
    lessons_covered: lessons,
    payment_date: new Date().toISOString().slice(0, 10),
    method: 'Stripe',
  })
  if (error) {
    console.error('Stripe webhook insert failed:', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ received: true, recorded: true })
}
