import { NextRequest, NextResponse } from 'next/server'
import { scheduleUpcomingBots } from '@/lib/schedule-bots'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

// Daily cron backstop: schedule a recorder bot for every upcoming lesson that
// maps to a student (see lib/schedule-bots). The same scan also runs whenever
// the teacher opens the app, so lessons already on the calendar get a bot
// without waiting for this daily run.
export async function GET(req: NextRequest) {
  const secret = clean(process.env.CRON_SECRET)
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const result = await scheduleUpcomingBots()
  return NextResponse.json(result, { status: 200 })
}
