/**
 * Creates the Lesson Studio products and prices in Stripe. Idempotent.
 *
 *   node scripts/stripe-setup.mjs          # show what exists / what is missing
 *   node scripts/stripe-setup.mjs --apply  # create anything missing
 *
 * Everything is keyed by the Price's lookup_key, which is what the app queries
 * at checkout — so running this twice creates nothing the second time, and the
 * app never stores a price id that could go stale.
 *
 * Prices are immutable in Stripe. To change an amount, bump the lookupKey in
 * lib/plans.ts to _v2 and run this again: the old price stays alive for the
 * people already on it, which IS the grandfathering.
 *
 * Reads STRIPE_SECRET_KEY from .env / .env.local. The key's own prefix decides
 * whether this touches test or live data, and the script says which up front.
 */
import fs from 'node:fs'
import path from 'node:path'
import Stripe from 'stripe'

// Same plan table the app uses, read rather than duplicated. It is TypeScript,
// so pull the literals out instead of importing it.
const plansSrc = fs.readFileSync(path.join(process.cwd(), 'lib', 'plans.ts'), 'utf-8')

function parseBlock(name) {
  const start = plansSrc.indexOf(`export const ${name}`)
  if (start < 0) throw new Error(`${name} not found in lib/plans.ts`)
  const slice = plansSrc.slice(start, plansSrc.indexOf('\n]', start) + 2)
  const out = []
  const re = /\{([^}]*)\}/g
  let m
  while ((m = re.exec(slice))) {
    const body = m[1]
    const get = (k) => {
      const mm = body.match(new RegExp(`${k}:\\s*'([^']*)'`)) || body.match(new RegExp(`${k}:\\s*(\\d+)`))
      return mm ? mm[1] : null
    }
    const lookupKey = get('lookupKey')
    if (!lookupKey) continue
    out.push({ id: get('id'), name: get('name'), price: Number(get('price')), recaps: Number(get('recaps')), lookupKey })
  }
  return out
}

function parseTopup() {
  const start = plansSrc.indexOf('export const TOPUP')
  const slice = plansSrc.slice(start, plansSrc.indexOf('\n}', start) + 2)
  const num = (k) => Number((slice.match(new RegExp(`${k}:\\s*(\\d+)`)) || [])[1])
  const str = (k) => (slice.match(new RegExp(`${k}:\\s*'([^']*)'`)) || [])[1]
  return { recaps: num('recaps'), price: num('price'), lookupKey: str('lookupKey') }
}

function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    const p = path.join(process.cwd(), f)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf-8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
    }
  }
}

loadEnv()
const key = (process.env.STRIPE_SECRET_KEY || '').trim()
if (!key) {
  console.error('Missing STRIPE_SECRET_KEY'); process.exit(1)
}
const live = key.startsWith('sk_live')
const apply = process.argv.includes('--apply')
const stripe = new Stripe(key)

const PLANS = parseBlock('PLANS')
const TOPUP = parseTopup()

console.log(`\nStripe mode: ${live ? 'LIVE — real money' : 'TEST'}`)
console.log(apply ? 'Applying changes.\n' : 'Dry run. Pass --apply to create anything missing.\n')

if (live && apply && !process.argv.includes('--yes-live')) {
  console.error('Refusing to write to LIVE without --yes-live.')
  process.exit(1)
}

async function ensure({ name, lookupKey, amount, recurring, description }) {
  const found = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 })
  if (found.data[0]) {
    const p = found.data[0]
    console.log(`  ok      ${lookupKey.padEnd(20)} ${p.id}  $${(p.unit_amount / 100).toFixed(2)}${recurring ? '/mo' : ''}`)
    return p
  }
  if (!apply) {
    console.log(`  MISSING ${lookupKey.padEnd(20)} would create $${(amount / 100).toFixed(2)}${recurring ? '/mo' : ''}`)
    return null
  }
  const product = await stripe.products.create({ name, description })
  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    unit_amount: amount,
    lookup_key: lookupKey,
    ...(recurring ? { recurring: { interval: 'month' } } : {}),
  })
  console.log(`  CREATED ${lookupKey.padEnd(20)} ${price.id}  $${(amount / 100).toFixed(2)}${recurring ? '/mo' : ''}`)
  return price
}

const results = []
for (const p of PLANS) {
  results.push(
    await ensure({
      name: `Lesson Studio — ${p.name}`,
      description: `${p.recaps} AI lesson recaps a month, unlimited students and portals.`,
      lookupKey: p.lookupKey,
      amount: p.price * 100,
      recurring: true,
    }),
  )
}
results.push(
  await ensure({
    name: `Lesson Studio — ${TOPUP.recaps} extra recaps`,
    description: `${TOPUP.recaps} additional recaps. Never expire; spent only after the monthly allowance.`,
    lookupKey: TOPUP.lookupKey,
    amount: TOPUP.price * 100,
    recurring: false,
  }),
)

const missing = results.filter((r) => !r).length
console.log(
  missing === 0
    ? '\nAll prices present.\n'
    : `\n${missing} missing. Re-run with --apply to create them.\n`,
)

/**
 * The billing webhook endpoint.
 *
 * Without this, Checkout succeeds and nothing happens: the allowance is only
 * ever granted by /api/billing/webhook, so a missing endpoint means a teacher
 * pays and stays on the trial. Idempotent on the URL.
 *
 * The signing secret is readable only at creation, so it is printed once — put
 * it in STRIPE_BILLING_WEBHOOK_SECRET. Deliberately a different secret from the
 * Connect endpoint's: one secret shared by two endpoints means a
 * misconfiguration silently verifies the wrong account's events.
 */
const WEBHOOK_URL = process.env.BILLING_WEBHOOK_URL || 'https://koku-library.app/api/billing/webhook'
const WEBHOOK_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]

console.log(`Webhook endpoint  ${WEBHOOK_URL}`)
const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
const existing = endpoints.data.find((e) => e.url === WEBHOOK_URL)
if (existing) {
  const same =
    WEBHOOK_EVENTS.every((t) => existing.enabled_events.includes(t)) && existing.status === 'enabled'
  console.log(`  ok      ${existing.id}  ${existing.enabled_events.length} events, ${existing.status}`)
  if (!same && apply) {
    await stripe.webhookEndpoints.update(existing.id, { enabled_events: WEBHOOK_EVENTS, disabled: false })
    console.log('  UPDATED events brought in line')
  } else if (!same) {
    console.log('  DRIFT   events differ - re-run with --apply to fix')
  }
  console.log('  note    signing secret is shown only at creation; it is unchanged')
} else if (!apply) {
  console.log('  MISSING would create it')
} else {
  const created = await stripe.webhookEndpoints.create({
    url: WEBHOOK_URL,
    enabled_events: WEBHOOK_EVENTS,
    description: 'Lesson Studio teacher subscriptions + top-ups',
  })
  console.log(`  CREATED ${created.id}`)
  console.log('')
  console.log('  Set this now - it is shown only once:')
  console.log(`  STRIPE_BILLING_WEBHOOK_SECRET=${created.secret}`)
}
console.log('')
