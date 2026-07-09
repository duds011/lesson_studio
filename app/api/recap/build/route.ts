import { NextRequest, NextResponse } from 'next/server'
import { buildRecapDraft } from '@/lib/build-recap'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Build a recap on demand (manual "Build recap" / "Rebuild from recording").
export async function POST(req: NextRequest) {
  try {
    const { eventId, studentName, lessonDate, lessonTitle, attendees } = await req.json()
    if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId.' }, { status: 400 })

    const r = await buildRecapDraft(eventId, { studentName, lessonDate, lessonTitle, attendees })
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status })
    return NextResponse.json({ ok: true, recap: r.recap, talk: r.talk, studentTalkPct: r.studentTalkPct })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
