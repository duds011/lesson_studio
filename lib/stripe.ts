import Stripe from 'stripe'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

let _stripe: Stripe | null = null

/** Platform Stripe client (test or live depending on the key). */
export function getStripe(): Stripe {
  const key = clean(process.env.STRIPE_SECRET_KEY)
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  if (!_stripe) _stripe = new Stripe(key)
  return _stripe
}

export function isStripeConfigured(): boolean {
  return Boolean(clean(process.env.STRIPE_SECRET_KEY))
}

// Currencies with no minor units — Stripe expects the whole-number amount.
const ZERO_DECIMAL = new Set(['JPY', 'KRW', 'VND', 'CLP', 'BIF', 'DJF', 'GNF', 'KMF', 'MGA', 'PYG', 'RWF', 'UGX', 'VUV', 'XAF', 'XOF', 'XPF'])

/** Convert a decimal amount (e.g. 120.00) to Stripe's smallest unit for the currency. */
export function toStripeAmount(amount: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100)
}

/** Inverse of toStripeAmount — Stripe minor units back to a decimal amount. */
export function fromStripeAmount(minor: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? minor : minor / 100
}
