/**
 * Set a user's password directly (service role). Useful when someone is locked
 * out and Supabase's built-in mailer is rate limited.
 *
 *   node scripts/set-password.mjs "email@example.com" "newpassword"
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
for (const line of readFileSync(path.join(root, '.env.local'), 'utf-8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
}

const [email, password] = process.argv.slice(2)
if (!email || !password) {
  console.error('usage: node scripts/set-password.mjs <email> <password>')
  process.exit(1)
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { autoRefreshToken: false, persistSession: false } },
)

let found = null
for (let page = 1; page <= 20 && !found; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
  if (error) { console.error('FAILED:', error.message); process.exit(1) }
  found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (data.users.length < 200) break
}
if (!found) { console.error('No user with that email'); process.exit(1) }

const { error } = await admin.auth.admin.updateUserById(found.id, {
  password,
  email_confirm: true,
})
if (error) { console.error('FAILED:', error.message); process.exit(1) }

console.log('✔ password set for', email)
console.log('  id:', found.id)
