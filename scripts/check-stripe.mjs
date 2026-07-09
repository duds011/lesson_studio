import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
for (const line of readFileSync(path.join(root,'.env.local'),'utf-8').split('\n')){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]??=m[2].replace(/^["']|["']$/g,'')}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim())
const acct = await stripe.accounts.retrieve()
console.log('Platform account:', acct.id, '| Connect enabled:', !!(acct.capabilities || acct.charges_enabled !== undefined))
// Try creating a throwaway Express connected account to confirm Connect is on.
try {
  const c = await stripe.accounts.create({ type:'express', capabilities:{ card_payments:{requested:true}, transfers:{requested:true} } })
  console.log('✓ Express account created:', c.id)
  const link = await stripe.accountLinks.create({ account:c.id, refresh_url:'https://example.com/r', return_url:'https://example.com/x', type:'account_onboarding' })
  console.log('✓ Onboarding link works:', link.url.slice(0,50)+'…')
  await stripe.accounts.del(c.id)
  console.log('✓ Cleaned up test account')
  console.log('\n✅ Connect is enabled and keys are valid.')
} catch (e) {
  console.log('✗ Connect check failed:', e.message)
  if (/Connect/i.test(e.message) || /sign up/i.test(e.message)) console.log('   → You likely need to finish enabling Connect in the Stripe dashboard.')
  process.exit(1)
}
