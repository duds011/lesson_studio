import { NextRequest, NextResponse } from 'next/server'
import { getRecaps, saveRecap } from '@/lib/store'
import { cleanCorrections, cleanStrengths } from '@/lib/openai'

export const dynamic = 'force-dynamic'

// Teacher edits a draft recap before approving: the recap body, any section,
// homework, the teacher's note, and which corrections survive review. Every
// field is optional — only supplied keys are overwritten.
const EXERCISE_TYPES = ['read_aloud', 'speak', 'multiple_choice', 'fill_blank']

export async function POST(req: NextRequest) {
  const { eventId, recap: body, sections, teacher_note, homework, corrections, did_well, exercises } = await req.json()
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })

  const all = await getRecaps()
  const rec = all[eventId]
  if (!rec) return NextResponse.json({ ok: false, error: 'No recap' }, { status: 404 })

  const recap = { ...(rec.recap || {}) }
  if (typeof body === 'string') recap.recap = body
  if (Array.isArray(sections)) {
    recap.sections = sections
      .map((s: any) => ({ title: String(s?.title ?? '').trim(), content: String(s?.content ?? '').trim() }))
      .filter((s: any) => s.title || s.content)
  }
  if (typeof teacher_note === 'string') recap.teacher_note = teacher_note
  // Same validation the generator runs, so a hand-edited list cannot put a
  // half-empty card in front of the student.
  if (Array.isArray(corrections)) recap.corrections = cleanCorrections(corrections)
  if (Array.isArray(did_well)) recap.did_well = cleanStrengths(did_well)
  if (Array.isArray(homework)) {
    recap.homework = homework
      .map((h: any) => ({ description: String(h?.description ?? '').trim() }))
      .filter((h: any) => h.description)
  }
  // Exercises are edited as whole objects; validation here is structural. The
  // data shapes differ per type and the editor is ours, so the guard is
  // against a malformed request, not against the teacher.
  if (Array.isArray(exercises)) {
    recap.exercises = exercises
      .filter((e: any) => e && EXERCISE_TYPES.includes(e.type) && typeof (e.data ?? {}) === 'object')
      .map((e: any) => ({ type: e.type, prompt: String(e.prompt ?? ''), data: e.data ?? {} }))
      .slice(0, 20)
  }

  await saveRecap({ ...rec, recap })
  return NextResponse.json({ ok: true })
}
