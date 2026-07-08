import { NextRequest, NextResponse } from 'next/server'
import { scheduleUpcomingBots } from '@/lib/schedule-bots'
import { listTeacherIds } from '@/lib/store'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

// Daily cron backstop: run the scan for EVERY connected teacher (the same scan
// also runs whenever a teacher opens the app). Enumerates teachers from the
// index maintained when each connects Google.
export async function GET(req: NextRequest) {
  const secret = clean(process.env.CRON_SECRET)
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const teacherIds = await listTeacherIds()
  const results: Record<string, any> = {}
  for (const teacherId of teacherIds) {
    try {
      results[teacherId] = await scheduleUpcomingBots(teacherId)
    } catch (e: any) {
      results[teacherId] = { ok: false, error: e?.message ?? 'failed' }
    }
  }
  return NextResponse.json({ ok: true, teachers: teacherIds.length, results }, { status: 200 })
}
