/**
 * The plans, in one place.
 *
 * Prices, recap allowances and Stripe lookup keys all live here so the settings
 * panel, the checkout route and the webhook can never disagree about what
 * "Starter" means. Stripe is the source of truth for what someone was CHARGED;
 * this file is the source of truth for what that entitles them to.
 *
 * `lookupKey` is the join between the two. It is set on the Stripe Price rather
 * than the Product, and it is versioned — raising a price later means creating
 * a new Price with `_v2` and pointing the plan at it, which leaves everyone on
 * the old price exactly where they are.
 */
export type Plan = {
  id: string
  name: string
  /** USD per month. Display only — Stripe holds the amount that is charged. */
  price: number
  /** Recaps per calendar month; written to profiles.recap_monthly_limit. */
  recaps: number
  tag: string
  blurb: string
  lookupKey: string
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    recaps: 15,
    tag: 'Teaching on the side',
    blurb: 'Three or four lessons a week, written up.',
    // _v2 because this id used to mean $29 for 25 recaps. A Price's amount
    // cannot be edited in Stripe, and scripts/stripe-setup only ever creates a
    // lookup key it cannot find — reusing _v1 would have left Stripe charging
    // the old $29 while this file advertised $19.
    lookupKey: 'koku_starter_v2',
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 29,
    recaps: 35,
    tag: 'A steady week',
    blurb: 'A steady weekly schedule, with room to spare.',
    lookupKey: 'koku_studio_v1',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 69,
    recaps: 90,
    tag: 'Most popular',
    blurb: 'Over twenty lessons a week, every one recapped.',
    // _v2 for the same reason as Starter: still 90 recaps, but $69 not $79.
    lookupKey: 'koku_pro_v2',
  },
]

/**
 * Plans nobody can buy any more, kept so the people on them are still
 * recognised. Every account that existed before the three-tier pricing was set
 * to the 30-recap Studio plan by migration 0023, and they keep it at the price
 * they signed up at — a grandfathered customer who opens Settings should see
 * their plan by name, not "Custom · 30 recaps".
 */
export const LEGACY_PLANS: Plan[] = [
  {
    // Retired rather than deleted when the tiers became 19/29/69. It never
    // reached a live Stripe price, so nobody should hold it — but a test
    // account that does still reads as "Light" instead of "Custom · 8 recaps".
    id: 'light',
    name: 'Light',
    price: 12,
    recaps: 8,
    tag: 'Legacy plan',
    blurb: 'The old entry plan, no longer sold.',
    lookupKey: 'koku_light_v1',
  },
  {
    id: 'starter-legacy',
    name: 'Starter',
    price: 27,
    recaps: 15,
    tag: 'Legacy plan',
    blurb: 'The original Starter, kept at its original price.',
    lookupKey: 'koku_starter_legacy',
  },
  {
    id: 'studio-legacy',
    // "Studio (original)", not "Studio": the current tiers now include a
    // Studio of their own, and a grandfathered teacher is shown their plan
    // beside the plans they could move up to. Both reading "Studio · 30" and
    // "Studio · 35" is a puzzle, not an offer.
    name: 'Studio (original)',
    price: 45,
    recaps: 30,
    tag: 'Legacy plan',
    blurb: 'The original Studio, kept at its original price.',
    lookupKey: 'koku_studio_legacy',
  },
]

/** Extra recaps, sold one bundle at a time. */
export const TOPUP = {
  recaps: 5,
  price: 10,
  lookupKey: 'koku_topup_5_v1',
}

const ALL = [...PLANS, ...LEGACY_PLANS]

export function planById(id?: string | null): Plan | null {
  if (!id) return null
  return ALL.find((p) => p.id === id) ?? null
}

export function planByLookupKey(key?: string | null): Plan | null {
  if (!key) return null
  return ALL.find((p) => p.lookupKey === key) ?? null
}

/**
 * Best guess at the plan from the allowance alone.
 *
 * Only for accounts provisioned by hand, before plan_id existed. A stored
 * plan_id always wins — this is the fallback, and it prefers a current plan
 * over a legacy one when two share a number. That is now a real case rather
 * than a hypothetical: today's $19 Starter and the legacy $27 Starter are both
 * 15 recaps, so a hand-provisioned 15 reads as the current one. Migration 0023
 * put every pre-existing account on studio-legacy (30), so the accounts this
 * fallback was written for are not the ones that collide.
 */
export function planForLimit(limit?: number | null): Plan | null {
  if (limit == null) return null
  return PLANS.find((p) => p.recaps === limit) ?? LEGACY_PLANS.find((p) => p.recaps === limit) ?? null
}

/** Is this a plan a new customer can still choose? */
export function isPurchasable(id?: string | null): boolean {
  return PLANS.some((p) => p.id === id)
}
