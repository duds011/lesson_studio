import { NextRequest, NextResponse } from 'next/server'
import { createBot } from '@/lib/recall'
import { saveBot } from '@/lib/store'
import { getTeacherId } from '@/lib/current-teacher'

export const dynamic = 'force-dynamic'

// Dispatch the lesson recorder into a meeting now (or scheduled via join_at).
export async function POST(req: NextRequest) {
  try {
    const teacherId = await getTeacherId()
    if (!teacherId) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    const { eventId, meetingUrl, botName, joinAt, studentName, lessonTitle, lessonDate, attendees } = await req.json()
    if (!eventId || !meetingUrl) {
      return NextResponse.json({ ok: false, error: 'Missing eventId or meetingUrl.' }, { status: 400 })
    }
    const bot = await createBot(meetingUrl, botName || 'Lesson Recorder', joinAt)
    await saveBot(teacherId, {
      eventId,
      botId: bot.id,
      status: bot.status,
      meetingUrl,
      createdAt: Date.now(),
      studentName: studentName || undefined,
      lessonTitle: lessonTitle || undefined,
      lessonDate: lessonDate || undefined,
      attendees: Array.isArray(attendees) ? attendees : undefined,
    })
    return NextResponse.json({ ok: true, botId: bot.id, status: bot.status })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
