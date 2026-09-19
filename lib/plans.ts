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
  lookupKey: string
}

/**
 * Three sizes, priced like batches of anything else.
 *
 * Two earlier ladders failed for opposite reasons. The first ran
 * $1.40/$1.32/$1.29 — a ladder in name only: because credits never expire, so
 * buying the SMALLEST pack repeatedly was cheaper cash than the "discount"
 * until you needed exactly a hundred. The second fixed that by dropping to
 * two packs, which worked but left nothing between "trying it" and
 * "full-time".
 *
 * What makes three work is that the small pack is honestly small-batch
 * priced. Its job is to turn the free write-ups into a first payment, not to
 * carry volume, so it is the dearest per lesson and by far the cheapest to
 * say yes to — $14 is a decision a teacher makes in a second.
 *
 * The gradient is deliberately shallow: $1.40 / $1.33 / $1.24, 11% end to
 * end. Shallow has an exact cost, worth writing down because it is the thing
 * that will tempt someone to flatten it further one day. The big pack becomes
 * the cheaper CASH basket at 100 x (its unit / the small unit) lessons — so
 * the spread and the big pack's useful range are literally the same number.
 * At 11% the 100-pack wins from 89 lessons up. Flatten it to 5% and it only
 * wins from 96, which is how the very first ladder died: nobody had a reason
 * to buy the big one unless they needed exactly a hundred.
 *
 * "Why would anyone not buy the biggest?" — many will, and that is the best
 * outcome: one payment, no card to expire, nothing to churn. The small pack
 * is not a defence against that. It is there so the teacher who is not ready
 * still pays something instead of leaving, and for the one who teaches eighty
 * lessons but only writes up the fifteen that matter.
 *
 * The unit price is never shown. A price per recap invites arithmetic against
 * somebody else's price per recap; a saving is a fact about this offer alone.
 */
export const PACKS: Pack[] = [
  {
    id: 'pack-10',
    name: '10 lessons',
    recaps: 10,
    price: 14,
    tag: 'Starting out',
    lookupKey: 'koku_pack_10_v1',
  },
  {
    id: 'pack-40',
    name: '40 lessons',
    recaps: 40,
    price: 53,
    tag: 'A steady schedule',
    lookupKey: 'koku_pack_40_v1',
  },
  {
    id: 'pack-100',
    name: '100 lessons',
    recaps: 100,
    price: 124,
    tag: 'Most popular',
    // _v4: $130, then $129, then $119, now $124. A Price's amount cannot be
    // edited in Stripe, so every new amount is a new key and the old ones are
    // left alone for anyone mid-checkout.
    lookupKey: 'koku_pack_100_v4',
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
 * The smallest saving worth printing, as a whole percent.
 *
 * With the shallow ladder the middle pack saves 5%, and a 5% badge is not a
 * reason to do anything — it just invites the reader to notice how little it
 * is. Below this the card shows nothing and lets the size and the price speak.
 */
export const MIN_SAVING_PCT = 8

/**
 * What this pack saves against buying the same number at the smallest pack's
 * rate, as a whole percent. Null for the smallest pack, which IS the rate,
 * and null for anything under MIN_SAVING_PCT.
 *
 * Computed rather than written down, so it cannot drift from the prices above
 * the way a hand-typed "save 8%" would the first time one of them moves.
 */
export function savingPct(pack: Pack): number | null {
  const base = PACKS[0].price / PACKS[0].recaps
  const full = pack.recaps * base
  if (full <= pack.price) return null
  const pct = Math.round(((full - pack.price) / full) * 100)
  return pct >= MIN_SAVING_PCT ? pct : null
}
