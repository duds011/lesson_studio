import { NextRequest, NextResponse } from 'next/server'
import { getRecaps, saveRecap } from '@/lib/store'
import { getTeacherId } from '@/lib/current-teacher'

export const dynamic = 'force-dynamic'

// Teacher edits a draft recap before approving: the recap body, any section,
// homework, and the teacher's note. Every field is optional — only supplied
// keys are overwritten.
export async function POST(req: NextRequest) {
  const teacherId = await getTeacherId()
  if (!teacherId) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
  const { eventId, recap: body, sections, teacher_note, homework } = await req.json()
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })

  const all = await getRecaps(teacherId)
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
  if (Array.isArray(homework)) {
    recap.homework = homework
      .map((h: any) => ({ description: String(h?.description ?? '').trim() }))
      .filter((h: any) => h.description)
  }

  await saveRecap(teacherId, { ...rec, recap })
  return NextResponse.json({ ok: true })
}
