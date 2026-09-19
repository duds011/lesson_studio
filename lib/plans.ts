/**
 * What a teacher can buy, in one place.
 *
 * These used to be three monthly subscriptions. They differed only in price
 * per recap — and barely: Studio worked out at $0.83 each, Pro at $0.77. A 7%
 * discount for tripling your commitment is not a reason to upgrade, and asked
 * point-blank what Pro got them, the honest answer was "a slightly lower unit
 * price", which is not an answer.
 *
 * The subscription shape was wrong for the customer too. A language teacher's
 * month is not flat — holidays, exam season, a student who pauses — and a
 * monthly allowance turns a quiet August into money burned. Packs do not
 * expire, so a slow month is just a slow month.
 *
 * Nobody had ever been charged a subscription, so none of this is a migration.
 *
 * `lookupKey` is still the join to Stripe: set on the Price rather than the
 * Product and versioned, so raising a price later means a new `_v2` key and
 * leaves anyone mid-purchase exactly where they are.
 */
export type Pack = {
  id: string
  name: string
  /** Write-ups this pack adds to the balance. */
  recaps: number
  /** USD, one payment. Display only — Stripe holds what is actually charged. */
  price: number
  tag: string
  blurb: string
  lookupKey: string
}

/**
 * Three sizes. The unit price falls from $1.40 to $1.32 to $1.29, but that
 * number is deliberately never shown to a buyer — the pages say "save 6%"
 * and "save 8%" instead, because a price per recap invites arithmetic against
 * a competitor's price per recap, and a saving is about this offer alone.
 *
 * The ladder stays shallow on purpose: the bigger pack should win on not
 * having to think about it again, not by making the small one look like a
 * penalty for teaching part-time.
 *
 * Prices end in 8 and 9 rather than on a round ten, and the middle pack sits
 * at $99 rather than the $101 its size implies — under the hundred is worth
 * more than two per cent of margin.
 */
export const PACKS: Pack[] = [
  {
    id: 'pack-20',
    name: '20 lessons',
    recaps: 20,
    price: 28,
    tag: 'Teaching on the side',
    blurb: 'About five weeks of a light schedule.',
    // _v2: this key was $30. A Price's amount cannot be edited in Stripe, so
    // a new amount is a new key — reusing _v1 would leave Stripe charging the
    // old price while this file advertised the new one.
    lookupKey: 'koku_pack_20_v2',
  },
  {
    id: 'pack-75',
    name: '75 lessons',
    recaps: 75,
    price: 99,
    tag: 'Most teachers',
    blurb: 'A steady weekly timetable, with room to spare.',
    lookupKey: 'koku_pack_75_v1',
  },
  {
    id: 'pack-100',
    name: '100 lessons',
    recaps: 100,
    price: 129,
    tag: 'Full-time',
    blurb: 'Twenty-odd lessons a week, every one written up.',
    // _v2: was $130.
    lookupKey: 'koku_pack_100_v2',
  },
]

/**
 * Write-ups a brand-new account opens with.
 *
 * Not a "plan" any more — it is the starting balance, set as the column
 * default in the database. The number lives here too because the copy that
 * explains it needs one, and two hand-typed threes would eventually disagree.
 */
export const TRIAL_RECAPS = 3

export function packById(id?: string | null): Pack | null {
  if (!id) return null
  return PACKS.find((p) => p.id === id) ?? null
}

export function packByLookupKey(key?: string | null): Pack | null {
  if (!key) return null
  return PACKS.find((p) => p.lookupKey === key) ?? null
}

/** Is this something a teacher can actually buy? */
export function isPurchasable(id?: string | null): boolean {
  return PACKS.some((p) => p.id === id)
}

/**
 * What this pack saves against buying the same number at the smallest pack's
 * rate, as a whole percent. Null for the smallest pack, which IS the rate.
 *
 * Computed rather than written down, so it cannot drift from the prices above
 * the way a hand-typed "save 8%" would the first time one of them moves.
 */
export function savingPct(pack: Pack): number | null {
  const base = PACKS[0].price / PACKS[0].recaps
  const full = pack.recaps * base
  if (full <= pack.price) return null
  return Math.round(((full - pack.price) / full) * 100)
}
