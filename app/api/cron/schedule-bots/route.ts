import { NextRequest, NextResponse } from 'next/server'
import { scheduleUpcomingBots } from '@/lib/schedule-bots'
import { listTeacherIds } from '@/lib/current-teacher'
import { runAsTeacher } from '@/lib/teacher-scope'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

// Daily cron backstop: schedule a recorder bot for every upcoming lesson that
// maps to a student (see lib/schedule-bots). The same scan also runs whenever
// the teacher opens the app, so lessons already on the calendar get a bot
// without waiting for this daily run.
//
// There is no session here, so each teacher's sweep runs inside an explicit
// runAsTeacher scope — otherwise the store has no idea whose calendar to read.
// One teacher failing (expired Google token, say) must not stop the rest.
export async function GET(req: NextRequest) {
  const secret = clean(process.env.CRON_SECRET)
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const teacherIds = await listTeacherIds()
  const results: Record<string, unknown> = {}

  for (const teacherId of teacherIds) {
    try {
      results[teacherId] = await runAsTeacher(teacherId, () => scheduleUpcomingBots())
    } catch (e: any) {
      results[teacherId] = { ok: false, error: e?.message ?? 'failed' }
    }
  }

  return NextResponse.json({ ok: true, teachers: teacherIds.length, results }, { status: 200 })
}
