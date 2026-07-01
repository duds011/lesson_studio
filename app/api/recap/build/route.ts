import { NextRequest, NextResponse } from 'next/server'
import { getTranscript } from '@/lib/recall'
import { generateRecap } from '@/lib/openai'
import { getBots, saveRecap } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Build a recap: fetch the bot's transcript → OpenAI → store draft.
export async function POST(req: NextRequest) {
  try {
    const { eventId, studentName } = await req.json()
    if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId.' }, { status: 400 })

    const bots = await getBots()
    const rec = bots[eventId]
    if (!rec) return NextResponse.json({ ok: false, error: 'No bot found for this lesson.' }, { status: 404 })

    const t = await getTranscript(rec.botId)
    if (!t.plain.trim()) {
      return NextResponse.json({ ok: false, error: 'Transcript is empty.' }, { status: 422 })
    }

    const recap = await generateRecap({ studentName: studentName || 'Student', transcript: t.plain })
    // Prefer the real diarized talk % when we have it.
    if (t.studentTalkPct != null) recap.talk_percentage = t.studentTalkPct

    await saveRecap({
      eventId,
      studentName: studentName || 'Student',
      recap,
      talk: t.talk,
      studentTalkPct: t.studentTalkPct,
      status: 'draft',
      createdAt: Date.now(),
    })

    return NextResponse.json({ ok: true, recap, talk: t.talk, studentTalkPct: t.studentTalkPct })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
