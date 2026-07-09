/**
 * Verifies teacher payment-methods storage + student visibility rules:
 *  1. Teacher (own client) can write & read profiles.payment_methods (RLS: profiles_own).
 *  2. A student's own client CANNOT read the teacher's profile row (RLS blocks it).
 *  3. The admin/service client CAN read it — the path the student portal uses.
 * Non-destructive: restores the teacher's original payment_methods at the end.
 *
 * Run with:  node scripts/check-payment-methods.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
function loadEnv() {
  const raw = readFileSync(path.join(root, '.env.local'), 'utf-8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnv()

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL.trim()
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY.trim()

const TEACHER = { email: 'noanoayo46@gmail.com', password: 'genoa12345' }
const STUDENT = { email: 'jeffganly@gmail.com', password: 'JeffLesson26!' }

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } })
let pass = 0, fail = 0
const ok = (c, m) => { c ? (pass++, console.log('  ✓', m)) : (fail++, console.log('  ✗', m)) }

async function signedClient(creds) {
  const c = createClient(URL, ANON, { auth: { persistSession: false } })
  const { error } = await c.auth.signInWithPassword(creds)
  if (error) throw new Error(`sign-in ${creds.email}: ${error.message}`)
  return c
}

const sampleMethods = [
  { id: 'chk1', type: 'bank', label: 'Bank transfer (EUR)', value: 'DE00 0000 0000 0000', note: 'Reference: your name' },
  { id: 'chk2', type: 'paypal', label: 'PayPal', value: 'https://paypal.me/noasensei' },
]

async function main() {
  const teacher = await signedClient(TEACHER)
  const { data: { user: teacherUser } } = await teacher.auth.getUser()

  // Snapshot original so we can restore.
  const { data: before } = await teacher.from('profiles').select('payment_methods').eq('id', teacherUser.id).single()
  const original = before?.payment_methods ?? []

  try {
    console.log('1. Teacher writes & reads own payment_methods')
    const { error: wErr } = await teacher.from('profiles').update({ payment_methods: sampleMethods }).eq('id', teacherUser.id)
    ok(!wErr, `write succeeded${wErr ? ' — ' + wErr.message : ''}`)
    const { data: rd } = await teacher.from('profiles').select('payment_methods').eq('id', teacherUser.id).single()
    ok(Array.isArray(rd?.payment_methods) && rd.payment_methods.length === 2, 'reads back 2 methods')

    console.log('2. Student cannot read the teacher profile row (RLS)')
    const student = await signedClient(STUDENT)
    const { data: leaked } = await student.from('profiles').select('payment_methods').eq('id', teacherUser.id).maybeSingle()
    ok(!leaked, 'student query returns no teacher profile row')

    console.log('3. Admin (service role) can read them — portal path')
    const { data: adminRead } = await admin.from('profiles').select('payment_methods').eq('id', teacherUser.id).single()
    ok(Array.isArray(adminRead?.payment_methods) && adminRead.payment_methods.length === 2, 'admin reads 2 methods')

    console.log('4. Student row exposes teacher_id for the lookup')
    const { data: srow } = await admin.from('students').select('teacher_id').eq('email', STUDENT.email).single()
    ok(srow?.teacher_id === teacherUser.id, 'student.teacher_id matches teacher')
  } finally {
    await teacher.from('profiles').update({ payment_methods: original }).eq('id', teacherUser.id)
    console.log('\nRestored original payment_methods.')
  }

  console.log(`\n${fail === 0 ? '✅ ALL PASS' : '❌ FAILURES'} — ${pass} passed, ${fail} failed`)
  process.exit(fail === 0 ? 0 : 1)
}
main().catch((e) => { console.error('ERROR', e); process.exit(1) })
