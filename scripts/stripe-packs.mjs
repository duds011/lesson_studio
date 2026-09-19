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
  { id: 'pack-10', name: '10 lesson write-ups', recaps: 10, price: 1400, eur: 1300, jpy: 2200, lookupKey: 'koku_pack_10_v1' },
  { id: 'pack-40', name: '40 lesson write-ups', recaps: 40, price: 5300, eur: 4900, jpy: 8300, lookupKey: 'koku_pack_40_v1' },
  { id: 'pack-100', name: '100 lesson write-ups', recaps: 100, price: 12400, eur: 11500, jpy: 19500, lookupKey: 'koku_pack_100_v4' },
]

/**
 * Euro and yen are not conversions done at checkout — they are amounts we set,
 * carried on the same Price as currency_options, so a teacher quoted €115 on
 * the website is charged exactly €115. They mirror lib/pack-currency.ts and
 * app/i18n/currency.ts on the site; all three have to move together.
 *
 * Yen takes no decimal places, so its amount is already in its smallest unit:
 * 19500 here is ¥19,500, not ¥195.
 */

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
  const found = await stripe(
    `prices?lookup_keys[]=${encodeURIComponent(pack.lookupKey)}&active=true&limit=1` +
      `&expand[]=data.currency_options`,
  )
  if (found.data.length) {
    const p = found.data[0]
    const opts = p.currency_options ?? {}
    const eurOk = opts.eur?.unit_amount === pack.eur
    const jpyOk = opts.jpy?.unit_amount === pack.jpy
    const matches = p.unit_amount === pack.price && p.type === 'one_time'
    console.log(
      `${pack.lookupKey.padEnd(20)} exists  $${(p.unit_amount / 100).toFixed(2)} ${p.type}` +
        `  eur ${eurOk ? 'ok' : '✗'}  jpy ${jpyOk ? 'ok' : '✗'}` +
        (matches ? '' : `  ⚠️  expected $${(pack.price / 100).toFixed(2)} one_time`)
    )
    if (matches && (!eurOk || !jpyOk)) {
      // currency_options CAN be updated on an existing Price — only the base
      // unit_amount is frozen — so this is a fix rather than a new key.
      await stripe(`prices/${p.id}`, {
        'currency_options[eur][unit_amount]': String(pack.eur),
        'currency_options[jpy][unit_amount]': String(pack.jpy),
      })
      console.log(`   → set eur ${pack.eur} and jpy ${pack.jpy} on the existing price`)
    }
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
    'currency_options[eur][unit_amount]': String(pack.eur),
    'currency_options[jpy][unit_amount]': String(pack.jpy),
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
