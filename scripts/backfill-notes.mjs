/**
 * Write a lesson note for every published lesson that has none.
 *
 * Teachers were reading the student's RECAP to remember what happened last
 * time — a document written for the student, opened by the teacher, to answer
 * a question the Notes tab exists for. The tab was empty because filling it is
 * a second write-up after the lesson is already over, and nobody does that.
 *
 * So it gets filled from what the recap already knows. The recap's sections
 * are ordered: what they DID first (conversation, reading, discussion), then
 * the language points that came out of it. That is exactly the shape of "what
 * happened last lesson", so the note is assembled from the section titles
 * rather than invented — no model call, nothing that can hallucinate a lesson
 * that did not happen.
 *
 *   node scripts/backfill-notes.mjs --teacher <email>            # dry run
 *   node scripts/backfill-notes.mjs --teacher <email> --apply
 *
 * Idempotent: a student who already has a note on a lesson's date is skipped,
 * so re-running adds only what is missing and never doubles anything up.
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

const arg = (name) => {
  const i = process.argv.indexOf(name)
  return i > -1 ? process.argv[i + 1] : null
}
const TEACHER = arg('--teacher')
const APPLY = process.argv.includes('--apply')
if (!TEACHER) {
  console.error('Usage: node scripts/backfill-notes.mjs --teacher <email> [--apply]')
  process.exit(1)
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { persistSession: false } },
)

/** Japanese recaps get Japanese labels. Anything else reads as English. */
const isJa = (s) => /[぀-ヿ一-龯]/.test(s || '')

/** "3. 仮定法と現在形" -> "仮定法と現在形" — the numbering is the recap's, not the note's. */
const clean = (t) => String(t || '').replace(/^\s*\d+\s*[.、）)]\s*/, '').trim()

/**
 * A few lines a teacher can read in the ten seconds before the next lesson.
 *
 * Deliberately not the whole recap: the first sections say what the hour was
 * spent on, the next few say what came out of it, and the counts say how dense
 * it was. Anything more and they would be reading the recap again.
 */
function noteFor({ lessonNumber, title, sections, vocab, corrections, score, ja }) {
  const titles = sections.map((s) => clean(s?.title)).filter(Boolean)

  // The recap prompt puts activities first and language points after them.
  const did = titles.slice(0, 3)
  const points = titles.slice(3, 7)

  const L = ja
    ? { lesson: `第${lessonNumber}回`, did: 'やったこと', points: '扱った項目', vocab: '語彙', corr: '訂正', score: 'スコア' }
    : { lesson: `Lesson ${lessonNumber}`, did: 'Did', points: 'Covered', vocab: 'vocab', corr: 'corrections', score: 'score' }

  const lines = [`${L.lesson} · ${clean(title)}`]
  if (did.length) lines.push(`${L.did}: ${did.join(ja ? '／' : ' · ')}`)
  if (points.length) lines.push(`${L.points}: ${points.join(ja ? '／' : ' · ')}`)

  const stats = []
  if (vocab) stats.push(`${L.vocab} ${vocab}`)
  if (corrections) stats.push(`${L.corr} ${corrections}`)
  if (score != null) stats.push(`${L.score} ${score}/10`)
  if (stats.length) lines.push(stats.join(ja ? '・' : ' · '))

  return lines.join('\n')
}

const { data: teacher } = await db
  .from('profiles').select('id, full_name, speaking_language, teaching_language')
  .eq('email', TEACHER).maybeSingle()
if (!teacher) { console.error(`No profile for ${TEACHER}`); process.exit(1) }

/**
 * The labels follow the TEACHER, not the recap.
 *
 * A note is her private record, and she reads one language whatever the lesson
 * was in — so a Japanese teacher of English gets Japanese labels around the
 * English topics, rather than the scaffolding flipping language from student to
 * student. Only when we know nothing about her does the content decide.
 */
const teacherJa = /japanese|日本語/i.test(teacher.speaking_language || teacher.teaching_language || '')

const { data: lessons, error } = await db
  .from('lessons')
  .select('id, lesson_number, lesson_date, title, student_id, status, students!inner ( full_name, teacher_id ), lesson_summaries ( recap_json, score )')
  .eq('students.teacher_id', teacher.id)
  .eq('status', 'published')
  .order('lesson_date', { ascending: true })
if (error) { console.error(error.message); process.exit(1) }

// One read for every note this teacher already has, so an existing note on a
// date is left exactly as the teacher wrote it.
const { data: existing } = await db
  .from('student_notes')
  .select('student_id, note_date')
  .eq('teacher_id', teacher.id)
const taken = new Set((existing ?? []).map((n) => `${n.student_id}|${n.note_date}`))

const rows = []
let skipped = 0
for (const l of lessons ?? []) {
  const sum = Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries
  const recap = sum?.recap_json
  if (!recap) { skipped++; continue }
  if (taken.has(`${l.student_id}|${l.lesson_date}`)) { skipped++; continue }

  const sections = Array.isArray(recap.sections) ? recap.sections : []
  const content = noteFor({
    lessonNumber: l.lesson_number,
    title: recap.lesson_title || l.title,
    sections,
    vocab: recap.vocab_total_count ?? null,
    corrections: Array.isArray(recap.corrections) ? recap.corrections.length : 0,
    score: sum?.score ?? recap.score ?? null,
    // Her language when the profile says so; otherwise let the lesson decide.
    ja: teacher.speaking_language || teacher.teaching_language
      ? teacherJa
      : isJa([recap.lesson_title || l.title, ...sections.map((s) => s?.title)].join(' ')),
  })

  rows.push({
    student_id: l.student_id,
    teacher_id: teacher.id,
    content,
    note_date: l.lesson_date,
    pinned: false,
  })
  const who = (Array.isArray(l.students) ? l.students[0] : l.students)?.full_name
  console.log(`\n── ${who} · ${l.lesson_date}\n${content}`)
}

console.log(`\n${rows.length} note(s) to write, ${skipped} skipped (already noted or no recap).`)
if (!APPLY) { console.log('Dry run. Re-run with --apply to write them.'); process.exit(0) }
if (!rows.length) process.exit(0)

const { error: insErr } = await db.from('student_notes').insert(rows)
if (insErr) { console.error(insErr.message); process.exit(1) }
console.log(`✅ Wrote ${rows.length} notes for ${teacher.full_name || TEACHER}.`)
