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
 * Three sizes, priced $1.50 / $1.40 / $1.30 a write-up.
 *
 * The ladder is deliberately shallow — 13% between the ends, not the 40% a
 * volume discount usually carries. The bigger pack should win on not having to
 * think about it again, rather than on being a bargain that makes the small
 * one look like a penalty for teaching part-time.
 *
 * For scale: a teacher charging around $35 an hour spends roughly 4% of the
 * lesson on having it written up.
 */
export const PACKS: Pack[] = [
  {
    id: 'pack-20',
    name: '20 lessons',
    recaps: 20,
    price: 30,
    tag: 'Teaching on the side',
    blurb: 'About five weeks of a light schedule.',
    lookupKey: 'koku_pack_20_v1',
  },
  {
    id: 'pack-50',
    name: '50 lessons',
    recaps: 50,
    price: 70,
    tag: 'Most teachers',
    blurb: 'A steady weekly timetable, with room to spare.',
    lookupKey: 'koku_pack_50_v1',
  },
  {
    id: 'pack-100',
    name: '100 lessons',
    recaps: 100,
    price: 130,
    tag: 'Full-time',
    blurb: 'Twenty-odd lessons a week, every one written up.',
    lookupKey: 'koku_pack_100_v1',
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

/** What one write-up costs in this pack, for the "$1.30 each" line. */
export function perRecap(pack: Pack): string {
  return `$${(pack.price / pack.recaps).toFixed(2)}`
}
