/**
 * Create a teacher account directly, with the email already confirmed.
 *
 * Bypasses the signup confirmation email entirely — useful when Supabase's
 * built-in SMTP is rate limited, or to provision the first teacher.
 *
 *   node scripts/create-teacher.mjs "email@example.com" "password" "Full Name"
 *
 * Onboarding is deliberately left incomplete, so the teacher still walks the
 * full setup flow on first sign-in.
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

const [email, password, fullName = 'Teacher'] = process.argv.slice(2)
if (!email || !password) {
  console.error('usage: node scripts/create-teacher.mjs <email> <password> [full name]')
  process.exit(1)
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // no confirmation mail is sent
  user_metadata: { role: 'teacher', full_name: fullName },
})
if (error) { console.error('FAILED:', error.message); process.exit(1) }

// The signup trigger creates the profile row; make sure the role is right and
// onboarding is still pending.
await admin.from('profiles').upsert({
  id: data.user.id,
  role: 'teacher',
  full_name: fullName,
  email,
  onboarding_completed_at: null,
  onboarding_step: 0,
})

const { data: profile } = await admin
  .from('profiles')
  .select('email, role, onboarding_completed_at')
  .eq('id', data.user.id)
  .single()

console.log('✔ created:', data.user.email)
console.log('  id      :', data.user.id)
console.log('  role    :', profile?.role)
console.log('  onboard :', profile?.onboarding_completed_at ? 'ALREADY DONE' : 'pending — will run on first sign-in')
