import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
function loadEnv(file: string) {
  try {
    for (const l of readFileSync(path.join(root, file), 'utf-8').split('\n')) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && process.env[m[1]] == null) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
    }
  } catch { /* ignore */ }
}
loadEnv('.env'); loadEnv('.env.local')

async function main() {
  // env must be set before these modules read process.env at import time.
  const { getTranscript } = await import('../lib/recall.ts')
  const { generateRecap } = await import('../lib/openai.ts')

  const BOT = process.argv[2]
  const STUDENT_ID = process.argv[3]
  const TEACHER_ID = process.argv[4]
  const NAME = process.argv[5]
  const SOURCE = 'manual-bot-' + BOT
  const region = (process.env.RECALL_REGION || 'eu-central-1').trim()

  // Lesson date from the bot's scheduled join time.
  const bot = await (await fetch(`https://${region}.recall.ai/api/v1/bot/${BOT}/`, { headers: { Authorization: `Token ${process.env.RECALL_API_KEY!.trim()}` } })).json()
  const lessonDate = (bot.join_at || new Date().toISOString()).slice(0, 10)

  console.log('Fetching transcript…')
  const t = await getTranscript(BOT)
  console.log('lines', t.lines.length, '| talk%', t.studentTalkPct, '| metrics', JSON.stringify(t.metrics))

  console.log('Generating recap (OpenAI)…')
  const recap: any = await generateRecap({ studentName: NAME, transcript: t.plain })
  if (t.studentTalkPct != null) recap.talk_percentage = t.studentTalkPct
  recap.metrics = t.metrics
  console.log('sections', recap.sections?.length, '| vocab', recap.vocab_total_count, '| wpm', t.metrics.studentWpm, '| score', recap.score)

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY!.trim(), { auth: { persistSession: false } })
  const title = String(recap.sections?.[0]?.title || 'Japanese lesson').replace(/^\d+\.\s*/, '')

  const { data: lessonRow, error: le } = await admin.from('lessons').upsert(
    { teacher_id: TEACHER_ID, student_id: STUDENT_ID, title, lesson_date: lessonDate, status: 'published', source_event_id: SOURCE },
    { onConflict: 'source_event_id' },
  ).select('id, lesson_number').single()
  if (le) throw le

  const { error: se } = await admin.from('lesson_summaries').upsert({
    lesson_id: lessonRow.id,
    recap: typeof recap.recap === 'string' ? recap.recap : null,
    recap_json: recap,
    score: recap.score ?? null,
    talk_percentage: recap.talk_percentage ?? null,
    vocab_total_count: recap.vocab_total_count ?? null,
    vocab_level_distribution: recap.vocab_level_distribution ?? null,
    teacher_note: recap.teacher_note ?? null,
    audio_script: recap.audio_script ?? null,
  }, { onConflict: 'lesson_id' })
  if (se) throw se

  console.log(`\nDONE → lesson ${lessonRow.id} (Lesson ${lessonRow.lesson_number}) for ${NAME}`)
}

main().catch((e) => { console.error('FAILED:', e?.message || e); process.exit(1) })
