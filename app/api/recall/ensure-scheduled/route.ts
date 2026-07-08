import { NextResponse } from 'next/server'
import { scheduleUpcomingBots } from '@/lib/schedule-bots'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Teacher-triggered scan (gated by middleware): runs on app load so upcoming
// lessons already on the calendar get a recorder bot without waiting for the
// daily cron. Idempotent — safe to call on every page load.
export async function POST() {
  const result = await scheduleUpcomingBots()
  return NextResponse.json(result, { status: 200 })
}
