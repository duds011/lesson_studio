/**
 * Give a lesson's vocabulary and corrections the voices they were said in.
 *
 *   npx tsx scripts/attach-lesson-audio.ts <lessonId|ext:recordingId> [...] [--redo]
 *   npx tsx scripts/attach-lesson-audio.ts --student <studentId> --last 5
 *
 * Reads what to look for out of the recap: every vocabulary row, and for each
 * correction both halves — the student's mistake and the teacher's fix.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Both files: this project keeps Supabase in .env.local and OPENAI_API_KEY in
// .env, and the first run failed on the half it did not read.
for (const name of ['.env.local', '.env']) {
  let text = ''
  try { text = readFileSync(join(process.cwd(), name), 'utf8') } catch { continue }
  for (const line of text.split('\n')) {
    const t = line.trim()
    const eq = t.indexOf('=')
    if (!t || t.startsWith('#') || eq < 0) continue
    const k = t.slice(0, eq)
    if (!process.env[k]) process.env[k] = t.slice(eq + 1).replace(/^"|"$/g, '')
  }
}

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : undefined
}

async function main() {
  const { createAdminClient } = await import('../lib/supabase/admin')
  const { attachLessonAudio } = await import('../lib/lesson-audio')
  type Wanted = import('../lib/lesson-audio').Wanted

  const admin = createAdminClient()
  const redo = process.argv.includes('--redo')

  let lessonIds = process.argv.slice(2).filter((a) => !a.startsWith('--') && a.length === 36)

  const student = arg('student')
  if (student) {
    const { data } = await admin
      .from('lessons').select('id').eq('student_id', student)
      .order('lesson_date', { ascending: false }).limit(Number(arg('last') ?? 5))
    lessonIds = (data ?? []).map((r: any) => r.id)
  }
  if (!lessonIds.length) {
    console.error('Nothing to do. Pass lesson ids, or --student <id> --last 5')
    process.exit(1)
  }

  for (const lessonId of lessonIds) {
    const { data: lesson } = await admin
      .from('lessons')
      .select('id, lesson_number, title, source_event_id, student_id')
      .eq('id', lessonId).maybeSingle()
    if (!lesson) { console.log(`\n${lessonId}: no such lesson`); continue }

    const eventId = String(lesson.source_event_id ?? '')
    const recordingId = eventId.startsWith('ext:') ? eventId.slice(4) : ''
    console.log(`\n=== Lesson ${lesson.lesson_number} — ${lesson.title}`)
    if (!recordingId) { console.log('  no extension recording; skipped'); continue }

    const { data: st } = await admin
      .from('students').select('language').eq('id', lesson.student_id).maybeSingle()

    /**
     * Which track is the teacher.
     *
     * mic_is is the stored answer and it is null on every lesson recorded
     * before that column existed — which resolves to "the mic is the teacher"
     * and is backwards for anyone who recorded their OWN lesson from a teacher
     * account. --teacher-track says it outright; the lib searches both anyway.
     */
    const { data: link } = await admin
      .from('lesson_event_links').select('mic_is').eq('event_id', eventId).maybeSingle()
    const override = arg('teacher-track') as 'mic' | 'tab' | undefined
    const teacherTrack = override ?? ((link as any)?.mic_is === 'teacher' ? 'mic' : 'tab')

    const { data: vocab } = await admin
      .from('vocabulary_items').select('id, word').eq('lesson_id', lessonId).order('sort_order')

    const { data: summary } = await admin
      .from('lesson_summaries').select('recap_json').eq('lesson_id', lessonId).maybeSingle()
    const corrections: any[] = ((summary?.recap_json as any)?.corrections ?? []) as any[]

    const wanted: Wanted[] = [
      ...((vocab ?? []) as any[]).map((v) => ({
        kind: 'vocab' as const, key: v.id, phrase: String(v.word), prefer: 'teacher' as const,
      })),
      // The mistake in the student's own voice, and the fix in the teacher's.
      // Indexed by position: a rebuild regenerates both the recap and these
      // clips, so the pairing cannot drift without both sides moving.
      ...corrections.flatMap((c, i) => {
        const said = String(c.said ?? '').trim()
        const fixed = String(c.correction ?? c.fixed ?? '').trim()
        const out: Wanted[] = []
        if (said) out.push({ kind: 'said', key: String(i), phrase: said, prefer: 'student' })
        if (fixed) out.push({ kind: 'fixed', key: String(i), phrase: fixed, prefer: 'teacher' })
        return out
      }),
    ]

    console.log(`  ${vocab?.length ?? 0} words, ${corrections.length} corrections · teacher on "${teacherTrack}"`)

    try {
      const res = await attachLessonAudio(admin, {
        recordingId,
        language: String(st?.language ?? 'English'),
        teacherTrack,
        wanted,
        redo,
        onProgress: (l) => console.log(l),
      })
      const byVoice = (v: string) => res.made.filter((m) => m.voice === v).length
      console.log(`  ${res.made.length} clipped (${byVoice('teacher')} teacher, ${byVoice('student')} student), ${res.missed.length} not found`)
      for (const m of res.made) {
        console.log(`    ${m.kind.padEnd(5)} ${m.voice.padEnd(7)} ${m.phrase.slice(0, 46).padEnd(48)} "${m.heard.slice(0, 40)}"`)
      }
      for (const m of res.missed) {
        console.log(`    MISS  ${m.kind.padEnd(5)} ${m.phrase.slice(0, 46).padEnd(48)} ${m.why}`)
      }
    } catch (e: any) {
      console.log(`  failed: ${e?.message || e}`)
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
