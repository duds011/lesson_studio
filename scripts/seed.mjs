/**
 * Seed the Supabase `lesson-studio` project from the committed lesson recaps.
 *
 * Creates (idempotently):
 *   - one teacher account (SEED_TEACHER_EMAIL / SEED_TEACHER_PASSWORD)
 *   - one student account per student in content/students.json that has a recap
 *   - lessons + summaries + sections + vocabulary + homework from content/lessons.json
 *
 * Reads credentials from .env.local. Run with:  node scripts/seed.mjs
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

// ── Minimal .env.local loader ────────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync(path.join(root, '.env.local'), 'utf-8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    /* rely on real env */
  }
}
loadEnv()

const URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const TEACHER_EMAIL = (process.env.SEED_TEACHER_EMAIL || '').trim()
const TEACHER_PASSWORD = (process.env.SEED_TEACHER_PASSWORD || '').trim()

if (!URL || !SERVICE_KEY) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
if (!TEACHER_EMAIL || !TEACHER_PASSWORD) throw new Error('Missing SEED_TEACHER_EMAIL / SEED_TEACHER_PASSWORD in .env.local')

const admin = createClient(URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

const students = JSON.parse(readFileSync(path.join(root, 'content/students.json'), 'utf-8'))
const lessons = Object.values(JSON.parse(readFileSync(path.join(root, 'content/lessons.json'), 'utf-8')))

async function findUserByEmail(email) {
  // Page through users (small dataset) to find an existing account.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (hit) return hit
    if (data.users.length < 200) break
  }
  return null
}

async function ensureUser(email, password, meta) {
  const existing = await findUserByEmail(email)
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, { password, user_metadata: meta })
    return existing.id
  }
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: meta })
  if (error) throw error
  return data.user.id
}

async function main() {
  // 1. Teacher
  const teacherId = await ensureUser(TEACHER_EMAIL, TEACHER_PASSWORD, { full_name: 'Teacher', role: 'teacher' })
  await admin.from('profiles').upsert({ id: teacherId, role: 'teacher', full_name: 'Teacher', email: TEACHER_EMAIL })
  console.log(`✔ Teacher: ${TEACHER_EMAIL}`)

  const studentsWithLessons = new Set(lessons.map((l) => l.studentId))
  const created = []

  for (const s of students) {
    if (!studentsWithLessons.has(s.id)) continue // only seed students who have a recap

    // Deterministic so re-running the seed doesn't churn credentials.
    const tempPassword = s.name.split(' ')[0].replace(/[^a-zA-Z]/g, '') + 'Lesson26!'
    const authId = await ensureUser(s.email, tempPassword, { full_name: s.name, role: 'student' })
    await admin.from('profiles').upsert({ id: authId, role: 'student', full_name: s.name, email: s.email })

    // Reset this student's rows so re-running is clean (cascade clears lessons).
    await admin.from('students').delete().eq('email', s.email)
    const { data: studentRow, error: sErr } = await admin
      .from('students')
      .insert({ profile_id: authId, teacher_id: teacherId, full_name: s.name, email: s.email, level: s.level, language: s.language })
      .select('id')
      .single()
    if (sErr) throw sErr

    const studentLessons = lessons.filter((l) => l.studentId === s.id).sort((a, b) => a.lessonNumber - b.lessonNumber)
    for (const l of studentLessons) {
      const r = l.recap || {}
      const { data: lessonRow, error: lErr } = await admin
        .from('lessons')
        .insert({
          student_id: studentRow.id,
          teacher_id: teacherId,
          lesson_number: l.lessonNumber,
          lesson_date: l.date,
          title: l.title || null,
          status: 'published',
        })
        .select('id')
        .single()
      if (lErr) throw lErr

      await admin.from('lesson_summaries').insert({
        lesson_id: lessonRow.id,
        recap: r.recap ?? null,
        score: r.score ?? null,
        talk_percentage: l.studentTalkPct ?? r.talk_percentage ?? null,
        vocab_total_count: r.vocab_total_count ?? null,
        vocab_level_distribution: r.vocab_level_distribution ?? null,
        teacher_note: r.teacher_note ?? null,
        audio_script: r.audio_script ?? null,
        recap_json: r, // full structured recap for the tabbed lesson view
      })

      if (Array.isArray(r.sections) && r.sections.length) {
        await admin.from('lesson_sections').insert(
          r.sections.map((sec, i) => ({ lesson_id: lessonRow.id, title: sec.title || `Section ${i + 1}`, content: sec.content ?? null, sort_order: i }))
        )
      }
      if (Array.isArray(r.vocabulary) && r.vocabulary.length) {
        await admin.from('vocabulary_items').insert(
          r.vocabulary.map((v, i) => ({
            lesson_id: lessonRow.id,
            word: v.word, reading: v.reading ?? null, definition: v.definition ?? null,
            explanation: v.explanation ?? null, example_sentence: v.example_sentence ?? null,
            jlpt_level: v.jlpt_level ?? null, sort_order: i,
          }))
        )
      }
      if (Array.isArray(r.homework) && r.homework.length) {
        await admin.from('homework_items').insert(
          r.homework.map((h, i) => ({ lesson_id: lessonRow.id, description: h.description, sort_order: i }))
        )
      }
    }

    created.push({ name: s.name, email: s.email, password: tempPassword, lessons: studentLessons.length })
    console.log(`✔ Student: ${s.name} (${studentLessons.length} lesson${studentLessons.length !== 1 ? 's' : ''})`)
  }

  console.log('\n── Student login credentials ─────────────────────────')
  for (const c of created) console.log(`${c.name.padEnd(24)} ${c.email.padEnd(34)} ${c.password}`)
  console.log('──────────────────────────────────────────────────────')
  console.log(`\nTeacher login: ${TEACHER_EMAIL} / (the password you set)`)
}

main().then(() => process.exit(0)).catch((e) => { console.error('SEED FAILED:', e.message || e); process.exit(1) })
