import { readFileSync } from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createClient } from '@supabase/supabase-js'
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
for (const l of readFileSync(path.join(root,'.env.local'),'utf-8').split('\n')){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]??=m[2].replace(/^["']|["']$/g,'')}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY.trim(), { auth: { persistSession: false } })
const TEACHER = '85e46f7b-e240-4389-84d7-5dc03cf28443'

// firstname + first-initial-of-lastname + 12345  (matches create-logins.mjs scheme)
const pwFor = (name) => { const p = name.trim().split(/\s+/); return (p[0] + (p[1]?p[1][0]:'') + '12345').toLowerCase() }

// The 6 students still on the old <FirstName>Lesson26! scheme
const TARGETS = ['andrikusumo@gmail.com','jameshcoker@gmail.com','jeffganly@gmail.com','delosriosjorge16@gmail.com','petrezselyemmartin@gmail.com','wogaoliveira2@gmail.com']

const { data: students } = await admin.from('students').select('id, full_name, email, profile_id').eq('teacher_id', TEACHER).not('profile_id','is',null).order('full_name')
const out = []
for (const s of students) {
  if (!TARGETS.includes(s.email.toLowerCase())) continue
  const password = pwFor(s.full_name)
  const { error } = await admin.auth.admin.updateUserById(s.profile_id, { password })
  if (error) { console.log(`✗ ${s.full_name} (${s.email}): ${error.message}`); continue }
  out.push({ name: s.full_name, email: s.email.toLowerCase(), password })
  console.log(`✓ ${s.full_name.padEnd(24)} ${s.email.toLowerCase().padEnd(34)} ${password}`)
}
console.log(`\nReset ${out.length} logins.`)
