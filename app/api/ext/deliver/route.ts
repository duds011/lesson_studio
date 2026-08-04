import { NextResponse } from 'next/server'
import { authenticateExtension } from '@/lib/ext-auth'
import { runAsTeacher } from '@/lib/teacher-scope'
import { getRecaps } from '@/lib/store'
import { deliverRecapToStudent } from '@/lib/recap-delivery'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Re-delivers an already-built recap to the student's portal.
 *
 * The publish step both marks a recap published and writes it to the student's
 * record. When only the second half failed the recap stayed "published" with
 * nothing behind it, and the portal offered no way to retry — this is that
 * retry. Pass no eventId to repair every published recap that never landed.
 */
export async function POST(req: Request) {
  const caller = await authenticateExtension(req)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { eventId } = await req.json().catch(() => ({}))

  try {
    const results = await runAsTeacher(caller.teacherId, async () => {
      const all = await getRecaps()
      const targets = eventId
        ? [eventId].filter((id) => all[id])
        : Object.keys(all).filter((id) => all[id]?.status === 'published')

      if (eventId && targets.length === 0) throw new Error(`No recap found for ${eventId}`)

      const out: any[] = []
      for (const id of targets) {
        try {
          out.push({ eventId: id, ...(await deliverRecapToStudent(id, all[id])) })
        } catch (e: any) {
          out.push({ eventId: id, delivered: false, reason: e?.message ?? 'failed' })
        }
      }
      return out
    })

    return NextResponse.json({ ok: true, results })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 })
  }
}
