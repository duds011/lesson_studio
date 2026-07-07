import { NextRequest, NextResponse } from 'next/server'
import { getTranscript } from '@/lib/recall'
import { generateRecap } from '@/lib/openai'
import { getBots, getRecaps, saveRecap } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Build a recap: fetch the bot's transcript → OpenAI → store a draft (with the
// lesson metadata used when the teacher approves + publishes it to the student).
export async function POST(req: NextRequest) {
  try {
    const { eventId, studentName, lessonDate, lessonTitle, attendees } = await req.json()
    if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId.' }, { status: 400 })

    const bots = await getBots()
    const rec = bots[eventId]
    if (!rec) return NextResponse.json({ ok: false, error: 'No bot found for this lesson.' }, { status: 404 })

    // On a rebuild, the request may omit lesson metadata — fall back to what the
    // existing draft already stored so we don't wipe the student linkage.
    const prev = (await getRecaps())[eventId]
    const name = studentName || prev?.studentName || 'Student'
    const date = lessonDate || prev?.lessonDate
    const title = lessonTitle || prev?.lessonTitle
    const atts = Array.isArray(attendees) && attendees.length ? attendees : prev?.attendees

    const t = await getTranscript(rec.botId)
    if (!t.plain.trim()) {
      return NextResponse.json({ ok: false, error: 'Transcript is empty.' }, { status: 422 })
    }

    const recap: any = await generateRecap({ studentName: name, transcript: t.plain })
    // Prefer the real diarized talk % when we have it.
    if (t.studentTalkPct != null) recap.talk_percentage = t.studentTalkPct
    // Attach measured Tier-1 fluency metrics (from the transcript's word timestamps).
    // NOTE: raw distinct-token counting is NOT a reliable vocab measure for
    // Japanese (fine ASR tokenization + noisy transcript inflates it), so the
    // headline vocab count stays the model's estimate. Proper measurement needs
    // a morphological analyzer (kuromoji) + JLPT dictionary — a later upgrade.
    recap.metrics = t.metrics

    await saveRecap({
      eventId,
      studentName: name,
      recap,
      talk: t.talk,
      studentTalkPct: t.studentTalkPct,
      status: 'draft',
      createdAt: Date.now(),
      lessonDate: date || undefined,
      lessonTitle: title || undefined,
      attendees: Array.isArray(atts) ? atts : undefined,
    })

    return NextResponse.json({ ok: true, recap, talk: t.talk, studentTalkPct: t.studentTalkPct })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
