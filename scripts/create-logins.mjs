import { readFileSync } from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createClient } from '@supabase/supabase-js'
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
for (const l of readFileSync(path.join(root,'.env.local'),'utf-8').split('\n')){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)process.env[m[1]]??=m[2].replace(/^["']|["']$/g,'')}
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY.trim(), { auth: { persistSession: false } })
const TEACHER = '85e46f7b-e240-4389-84d7-5dc03cf28443'

const pwFor = (name) => { const p = name.trim().split(/\s+/); return (p[0] + (p[1]?p[1][0]:'') + '12345').toLowerCase() }

const { data: students } = await admin.from('students').select('id, full_name, email, profile_id').eq('teacher_id', TEACHER).is('profile_id', null).order('full_name')
console.log(`${students.length} students without a login:\n`)
const out = []
for (const s of students) {
  const password = pwFor(s.full_name)
  const email = s.email.toLowerCase()
  const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role: 'student', full_name: s.full_name } })
  if (error) { console.log(`✗ ${s.full_name} (${email}): ${error.message}`); continue }
  const { error: le } = await admin.from('students').update({ profile_id: created.user.id }).eq('id', s.id)
  if (le) { console.log(`✗ link ${s.full_name}: ${le.message}`); continue }
  out.push({ name: s.full_name, email, password })
  console.log(`✓ ${s.full_name.padEnd(24)} ${email.padEnd(34)} ${password}`)
}
console.log(`\nCreated ${out.length} logins.`)
