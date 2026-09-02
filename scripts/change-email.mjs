/**
 * Move an account to a new email address.
 *
 * Through the admin API rather than SQL: Supabase keeps the address in
 * auth.users AND in the provider row in auth.identities, and updating the
 * table directly leaves the identity behind — the account then signs in under
 * the old address and reads as the new one, which is a confusing thing to
 * debug six months later. `email_confirm` applies it immediately instead of
 * mailing a confirmation link to an address nobody is watching.
 *
 * The password is untouched. profiles.email is updated to match, since the app
 * reads that one for display.
 *
 *   node scripts/change-email.mjs --from old@x.com --to new@y.com          # dry run
 *   node scripts/change-email.mjs --from old@x.com --to new@y.com --apply
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
for (const l of readFileSync(path.join(root, '.env.local'), 'utf-8').split('\n')) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
}

const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null }
const FROM = arg('--from')
const TO = arg('--to')
const APPLY = process.argv.includes('--apply')
if (!FROM || !TO) {
  console.error('Usage: node scripts/change-email.mjs --from <old> --to <new> [--apply]')
  process.exit(1)
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { persistSession: false } },
)

// listUsers is paged; the roster is small, but page until found rather than
// assuming the account is on page one.
let user = null
for (let page = 1; page <= 20 && !user; page++) {
  const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 })
  if (error) { console.error(error.message); process.exit(1) }
  if (!data.users.length) break
  user = data.users.find((u) => (u.email || '').toLowerCase() === FROM.toLowerCase()) || null
}
if (!user) { console.error(`No account with ${FROM}`); process.exit(1) }

const clash = (await db.auth.admin.listUsers({ page: 1, perPage: 200 })).data.users
  .find((u) => (u.email || '').toLowerCase() === TO.toLowerCase() && u.id !== user.id)
if (clash) { console.error(`${TO} is already used by another account.`); process.exit(1) }

const { data: profile } = await db.from('profiles').select('id, role, full_name, email').eq('id', user.id).maybeSingle()

console.log(`account   ${user.id}`)
console.log(`name      ${profile?.full_name ?? '—'} (${profile?.role ?? 'no profile'})`)
console.log(`auth      ${user.email}  ->  ${TO}`)
console.log(`profile   ${profile?.email ?? '—'}  ->  ${TO}`)

if (!APPLY) { console.log('\nDry run. Re-run with --apply to make the change.'); process.exit(0) }

const { error: ae } = await db.auth.admin.updateUserById(user.id, { email: TO, email_confirm: true })
if (ae) { console.error(`auth update failed: ${ae.message}`); process.exit(1) }

if (profile) {
  const { error: pe } = await db.from('profiles').update({ email: TO }).eq('id', user.id)
  if (pe) { console.error(`profile update failed: ${pe.message}`); process.exit(1) }
}

const { data: after } = await db.auth.admin.getUserById(user.id)
console.log(`\n✅ ${after.user.email} — password unchanged, sign in with the new address.`)
