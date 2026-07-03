import { NextRequest, NextResponse } from 'next/server'
import { removeBot } from '@/lib/recall'
import { deleteBot, getBots } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json()
    if (!eventId) {
      return NextResponse.json({ ok: false, error: 'Missing eventId.' }, { status: 400 })
    }

    const bots = await getBots()
    const tracked = bots[eventId]
    if (!tracked) {
      return NextResponse.json({ ok: false, error: 'No active recorder found for this lesson.' }, { status: 404 })
    }

    await removeBot(tracked.botId)
    await deleteBot(eventId)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'Could not cancel the recorder.' },
      { status: 500 },
    )
  }
}
