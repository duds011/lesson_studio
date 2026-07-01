import { NextResponse } from 'next/server'
import { getBot, friendlyStatus } from '@/lib/recall'
import { getBots, updateBotStatus } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Refresh live status for all tracked bots, keyed by eventId.
export async function GET() {
  const bots = await getBots()
  const out: Record<string, { botId: string; status: string; label: string; state: string }> = {}

  await Promise.all(
    Object.values(bots).map(async (rec) => {
      let status = rec.status
      try {
        const live = await getBot(rec.botId)
        status = live.status
        if (status !== rec.status) await updateBotStatus(rec.eventId, status)
      } catch {
        /* keep last known status */
      }
      const f = friendlyStatus(status)
      out[rec.eventId] = { botId: rec.botId, status, label: f.label, state: f.state }
    })
  )

  return NextResponse.json({ ok: true, bots: out })
}
