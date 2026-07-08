import { NextRequest, NextResponse } from 'next/server'
import { removeBot } from '@/lib/recall'
import { deleteBot, getBots } from '@/lib/store'
import { getTeacherId } from '@/lib/current-teacher'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const teacherId = await getTeacherId()
    if (!teacherId) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
    const { eventId } = await req.json()
    if (!eventId) {
      return NextResponse.json({ ok: false, error: 'Missing eventId.' }, { status: 400 })
    }

    const bots = await getBots(teacherId)
    const tracked = bots[eventId]
    if (!tracked) {
      return NextResponse.json({ ok: false, error: 'No active recorder found for this lesson.' }, { status: 404 })
    }

    await removeBot(tracked.botId)
    await deleteBot(teacherId, eventId)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'Could not cancel the recorder.' },
      { status: 500 },
    )
  }
}
