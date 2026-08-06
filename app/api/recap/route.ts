import { NextRequest, NextResponse } from 'next/server'
import { deleteRecap, dismissRecap, getRecaps, setRecapStatus } from '@/lib/store'
import { createAdminClient } from '@/lib/supabase/admin'
import { deliverRecapToStudent } from '@/lib/recap-delivery'

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

// Publish a recap (teacher approval) → also write it to the student's Supabase
// record so it shows in their portal, including the whiteboard snapshot.
export async function POST(req: NextRequest) {
  const { eventId } = await req.json()
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })

  const all = await getRecaps()
  const rec = all[eventId]
  if (!rec) return NextResponse.json({ ok: false, error: 'No recap to publish' }, { status: 404 })

  await setRecapStatus(eventId, 'published')

  // Bridge the built recap to the student's Supabase record.
  let delivered = false
  let lessonId: string | null = null
  try {
    const res = await deliverRecapToStudent(eventId, rec)
    delivered = res.delivered
    if (res.delivered) lessonId = res.lessonId
  } catch (e: any) {
    console.error('recap publish bridge failed', e?.message || e)
    return NextResponse.json({ ok: true, delivered: false, warning: 'Published, but could not deliver to the student portal.' })
  }

  // lessonId lets the review page attach anything recorded during review —
  // a voice memo made before the lesson row existed.
  return NextResponse.json({ ok: true, delivered, lessonId })
}

// Delete a draft recap that the teacher does not want to review/send.
export async function DELETE(req: NextRequest) {
  const { eventId } = await req.json()
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })

  const all = await getRecaps()
  const rec = all[eventId]
  if (!rec) return NextResponse.json({ ok: false, error: 'No recap to delete' }, { status: 404 })
  if (rec.status === 'published') {
    return NextResponse.json({ ok: false, error: 'Published recaps cannot be deleted here' }, { status: 409 })
  }

  await deleteRecap(eventId)
  await dismissRecap(eventId)
  return NextResponse.json({ ok: true })
}
