import { NextResponse } from 'next/server'
import { getBots, getDismissedRecaps, getRecaps } from '@/lib/store'
import { friendlyStatus } from '@/lib/recall'
import { buildRecapDraft } from '@/lib/build-recap'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Teacher-triggered (gated by middleware) + fired by <OverviewSync/> on app
// load: auto-build a draft recap for every finished recording that doesn't have
// one yet, so recaps land in "Recaps to review" without a manual Build step.
export async function POST() {
  const [bots, dismissed, recaps] = await Promise.all([getBots(), getDismissedRecaps(), getRecaps()])
  const pending = Object.values(bots).filter((b) => friendlyStatus(b.status).state === 'done' && !recaps[b.eventId] && !dismissed[b.eventId])

  const built: string[] = []
  const failed: { eventId: string; error: string }[] = []
  // Build sequentially (each is an OpenAI call); the daily/next load finishes any
  // that don't fit this invocation's time budget. Idempotent — already-built
  // recordings are skipped next time.
  for (const b of pending.slice(0, 3)) {
    try {
      const r = await buildRecapDraft(b.eventId)
      if (r.ok) built.push(b.eventId)
      else failed.push({ eventId: b.eventId, error: r.error })
    } catch (e: any) {
      failed.push({ eventId: b.eventId, error: e?.message ?? 'failed' })
    }
  }

  return NextResponse.json({ ok: true, built: built.length, pending: pending.length, failed })
}
