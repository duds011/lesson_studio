import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { tagPartsOfSpeech } from '@/lib/openai'

/**
 * One-off catch-up: tag vocabulary published before `part_of_speech` existed.
 *
 * New recaps carry the field from generation. Everything already in the table
 * has none, so the practice decks would be empty for every existing student
 * until they had a fresh lesson. This walks the untagged key words a batch at
 * a time and fills them in.
 *
 * Only key words: they are the ones that carry a definition and an example, so
 * they are the only ones that make a card — and the only ones the model can
 * classify well.
 *
 * Bearer CRON_SECRET, same as the other operational routes. Safe to re-run:
 * it only ever looks at rows that are still null.
 */
export const maxDuration = 300

const BATCH = 40

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  }

  const url = new URL(req.url)
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 200), 500)
  const dryRun = url.searchParams.get('dry') === '1'

  const admin = createAdminClient()

  // Every untagged card, with the language it was taught in — which lives on
  // the student, two joins away.
  const { data: rows, error } = await admin
    .from('vocabulary_items')
    .select('id, word, definition, example_sentence, lessons!inner ( students!inner ( id, full_name, language ) )')
    .eq('is_key', true)
    .is('part_of_speech', null)
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!rows?.length) return NextResponse.json({ ok: true, tagged: 0, message: 'Nothing left to tag.' })

  // Group by language: one prompt cannot sensibly judge French and Japanese at
  // once, and the model does better told which language it is reading.
  const byLanguage = new Map<string, typeof rows>()
  for (const r of rows) {
    const lesson: any = Array.isArray((r as any).lessons) ? (r as any).lessons[0] : (r as any).lessons
    const student: any = Array.isArray(lesson?.students) ? lesson.students[0] : lesson?.students
    const lang = String(student?.language ?? '').trim() || 'the target language'
    if (!byLanguage.has(lang)) byLanguage.set(lang, [] as any)
    byLanguage.get(lang)!.push(r)
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      pending: rows.length,
      byLanguage: Object.fromEntries(Array.from(byLanguage, ([k, v]) => [k, v.length])),
    })
  }

  let tagged = 0
  const failures: string[] = []
  for (const [language, items] of Array.from(byLanguage)) {
    for (let i = 0; i < items.length; i += BATCH) {
      const slice = items.slice(i, i + BATCH)
      try {
        const map = await tagPartsOfSpeech(language, slice as any)
        // One update per row: a single write for the batch would need an
        // upsert, and upsert on this table would clobber the other columns.
        for (const [id, pos] of Object.entries(map)) {
          const { error: ue } = await admin.from('vocabulary_items').update({ part_of_speech: pos }).eq('id', id)
          if (ue) failures.push(`${id}: ${ue.message}`)
          else tagged++
        }
      } catch (e: any) {
        failures.push(`${language} batch ${i / BATCH}: ${e?.message ?? e}`)
      }
    }
  }

  const { count: left } = await admin
    .from('vocabulary_items')
    .select('id', { count: 'exact', head: true })
    .eq('is_key', true)
    .is('part_of_speech', null)

  return NextResponse.json({ ok: true, tagged, stillUntagged: left, failures: failures.slice(0, 10) })
}
