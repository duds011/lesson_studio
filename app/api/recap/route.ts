import { NextRequest, NextResponse } from 'next/server'
import { getRecaps, setRecapStatus } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Get a stored recap for an event.
export async function GET(req: NextRequest) {
  const eventId = new URL(req.url).searchParams.get('eventId')
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })
  const all = await getRecaps()
  const rec = all[eventId]
  if (!rec) return NextResponse.json({ ok: false, error: 'No recap' }, { status: 404 })
  return NextResponse.json({ ok: true, ...rec })
}

// Publish a recap (teacher approval).
export async function POST(req: NextRequest) {
  const { eventId } = await req.json()
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })
  await setRecapStatus(eventId, 'published')
  return NextResponse.json({ ok: true })
}
