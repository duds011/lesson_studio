import { NextRequest, NextResponse } from 'next/server'
import { getRecaps, saveRecap } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Teacher edits a draft recap before approving: the teacher's note + homework.
export async function POST(req: NextRequest) {
  const { eventId, teacher_note, homework } = await req.json()
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })

  const all = await getRecaps()
  const rec = all[eventId]
  if (!rec) return NextResponse.json({ ok: false, error: 'No recap' }, { status: 404 })

  const recap = { ...(rec.recap || {}) }
  if (typeof teacher_note === 'string') recap.teacher_note = teacher_note
  if (Array.isArray(homework)) {
    recap.homework = homework
      .map((h: any) => ({ description: String(h?.description ?? '').trim() }))
      .filter((h: any) => h.description)
  }

  await saveRecap({ ...rec, recap })
  return NextResponse.json({ ok: true })
}
