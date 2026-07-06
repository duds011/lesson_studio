import { NextRequest, NextResponse } from 'next/server'
import { getTranscript } from '@/lib/recall'
import { generateRecap } from '@/lib/openai'
import { getBots, saveRecap } from '@/lib/store'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapEventToStudent } from '@/lib/lesson-link'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Build a recap: fetch the bot's transcript + the shared lesson doc → OpenAI →
// store draft (with the whiteboard snapshot + lesson metadata for publishing).
export async function POST(req: NextRequest) {
  try {
    const { eventId, studentName, lessonDate, lessonTitle, attendees } = await req.json()
    if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId.' }, { status: 400 })

    const bots = await getBots()
    const rec = bots[eventId]
    if (!rec) return NextResponse.json({ ok: false, error: 'No bot found for this lesson.' }, { status: 404 })

    const t = await getTranscript(rec.botId)
    if (!t.plain.trim()) {
      return NextResponse.json({ ok: false, error: 'Transcript is empty.' }, { status: 422 })
    }

    // Pull the shared lesson doc for the matched student (feeds the AI + the recap tab).
    const admin = createAdminClient()
    const linked = await mapEventToStudent(admin, eventId, Array.isArray(attendees) ? attendees : [])
    let whiteboardText = ''
    let whiteboardHtml = ''
    if (linked) {
      const { data: doc } = await admin.from('lesson_docs').select('content_text, content_html').eq('student_id', linked.studentId).maybeSingle()
      whiteboardText = (doc?.content_text ?? '').trim()
      whiteboardHtml = (doc?.content_html ?? '').trim()
    }

    const recap = await generateRecap({ studentName: studentName || linked?.fullName || 'Student', transcript: t.plain, whiteboard: whiteboardText })
    // Prefer the real diarized talk % when we have it.
    if (t.studentTalkPct != null) recap.talk_percentage = t.studentTalkPct

    await saveRecap({
      eventId,
      studentName: studentName || linked?.fullName || 'Student',
      recap,
      talk: t.talk,
      studentTalkPct: t.studentTalkPct,
      status: 'draft',
      createdAt: Date.now(),
      whiteboardHtml: whiteboardHtml || undefined,
      lessonDate: lessonDate || undefined,
      lessonTitle: lessonTitle || undefined,
      attendees: Array.isArray(attendees) ? attendees : undefined,
    })

    // Lesson is over once we build the recap → close the live doc.
    if (linked) {
      try { await admin.from('lesson_docs').update({ active: false }).eq('student_id', linked.studentId) } catch {}
    }

    return NextResponse.json({ ok: true, recap, talk: t.talk, studentTalkPct: t.studentTalkPct })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
