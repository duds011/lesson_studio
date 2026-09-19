/**
 * Create the three write-up packs in Stripe.
 *
 * Idempotent and safe to re-run: it looks a lookup key up first and only
 * creates what is missing. Run it against a test key to try the flow, then
 * against the live key on the day you switch billing on — nothing in the app
 * changes between the two, because the app only ever asks for a lookup key.
 *
 *   node scripts/stripe-packs.mjs            # reads STRIPE_SECRET_KEY from .env.local
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/stripe-packs.mjs
 *
 * Products are found with list() and a local cache, never with products.search():
 * search is eventually consistent, so a re-run moments later does not see what
 * the last one made and creates a duplicate. That bug has been fixed twice in
 * this codebase already.
 */
import { readFileSync } from 'node:fs'

// Mirrors lib/plans.ts. The _v2 keys exist because a Price's amount cannot be
// edited in Stripe — a new amount is always a new key, and the old one is left
// alone so anyone mid-checkout still pays what they were quoted.
const PACKS = [
  { id: 'pack-20', name: '20 lesson write-ups', recaps: 20, price: 2800, lookupKey: 'koku_pack_20_v2' },
  { id: 'pack-75', name: '75 lesson write-ups', recaps: 75, price: 9900, lookupKey: 'koku_pack_75_v1' },
  { id: 'pack-100', name: '100 lesson write-ups', recaps: 100, price: 12900, lookupKey: 'koku_pack_100_v2' },
]

function env() {
  if (process.env.STRIPE_SECRET_KEY) return process.env.STRIPE_SECRET_KEY.trim()
  try {
    const file = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    for (const line of file.split('\n')) {
      const t = line.trim()
      if (t.startsWith('STRIPE_SECRET_KEY=')) return t.slice('STRIPE_SECRET_KEY='.length).trim()
    }
  } catch {}
  return ''
}

const KEY = env()
if (!KEY) {
  console.error('No STRIPE_SECRET_KEY — pass it in the environment or put it in .env.local.')
  process.exit(1)
}
const MODE = KEY.startsWith('sk_live_') ? 'LIVE' : 'test'

async function stripe(path, body) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${KEY}`,
      ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    ...(body ? { body: new URLSearchParams(body).toString() } : {}),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`${path}: ${json?.error?.message ?? res.status}`)
  return json
}

console.log(`Stripe account: ${MODE} mode\n`)

// Every product once, so the name→id map is built from one consistent read.
const existingProducts = await stripe('products?limit=100&active=true')
const productByName = new Map(existingProducts.data.map((p) => [p.name, p.id]))

for (const pack of PACKS) {
  const found = await stripe(`prices?lookup_keys[]=${encodeURIComponent(pack.lookupKey)}&active=true&limit=1`)
  if (found.data.length) {
    const p = found.data[0]
    const matches = p.unit_amount === pack.price && p.type === 'one_time'
    console.log(
      `${pack.lookupKey.padEnd(20)} exists  $${(p.unit_amount / 100).toFixed(2)} ${p.type}` +
        (matches ? '' : `  ⚠️  expected $${(pack.price / 100).toFixed(2)} one_time`)
    )
    if (!matches) {
      console.log(
        `   A Price's amount cannot be edited in Stripe. To change it, give the pack a\n` +
          `   new lookup key (_v2) in lib/plans.ts and re-run — anyone mid-purchase is untouched.`
      )
    }
    continue
  }

  let productId = productByName.get(pack.name)
  if (!productId) {
    const product = await stripe('products', {
      name: pack.name,
      description: `${pack.recaps} lessons written up. One payment, never expires.`,
      'metadata[pack_id]': pack.id,
      'metadata[recaps]': String(pack.recaps),
      // Managed Payments tax code for SaaS, matching the rest of the catalogue.
      tax_code: 'txcd_10103000',
    })
    productId = product.id
    productByName.set(pack.name, productId)
  }

  const price = await stripe('prices', {
    product: productId,
    unit_amount: String(pack.price),
    currency: 'usd',
    lookup_key: pack.lookupKey,
    transfer_lookup_key: 'true',
    'metadata[pack_id]': pack.id,
    'metadata[recaps]': String(pack.recaps),
  })

  console.log(
    `${pack.lookupKey.padEnd(20)} created $${(pack.price / 100).toFixed(2)} one_time  ${price.id}`
  )
}

console.log(
  `\nDone. The app resolves these by lookup key at request time, so nothing in the\n` +
    `code refers to a price id and this same script sets up any account.`
)
if (MODE === 'test') {
  console.log(`\nThis was TEST mode. Re-run with the live key to sell for real.`)
}
