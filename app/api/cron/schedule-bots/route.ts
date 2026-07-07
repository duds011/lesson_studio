import { NextRequest, NextResponse } from 'next/server'
import { listLessonsInRange } from '@/lib/google'
import { createBot } from '@/lib/recall'
import { getBots, saveBot } from '@/lib/store'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapEventToStudent } from '@/lib/lesson-link'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

// Daily cron: pre-schedule the recorder bot (join_at) for every upcoming lesson
// that maps to a real student. Recall joins each at the lesson start. Lessons
// with no matching student (e.g. trials) get NO bot. Runs once/day on Hobby, so
// it schedules a wide window ahead; same-day late bookings use manual Record.
export async function GET(req: NextRequest) {
  const secret = clean(process.env.CRON_SECRET)
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const now = Date.now()
  const from = new Date(now).toISOString()
  const to = new Date(now + 30 * 3600_000).toISOString() // next ~30h

  let lessons
  try {
    lessons = await listLessonsInRange(from, to)
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message === 'SCOPE' ? 'Calendar needs reconnect' : (e?.message ?? 'calendar failed') }, { status: 200 })
  }

  const bots = await getBots()
  const admin = createAdminClient()
  const scheduled: string[] = []
  const skipped: { title: string; reason: string }[] = []

  for (const l of lessons) {
    if (!l.meetingUrl) { skipped.push({ title: l.title, reason: 'no meeting link' }); continue }
    if (bots[l.id]) continue // already has a bot
    if (new Date(l.start).getTime() <= now) continue // already started

    const linked = await mapEventToStudent(admin, l.id, l.attendees ?? [])
    if (!linked) { skipped.push({ title: l.title, reason: 'not a student' }); continue }

    try {
      const joinAt = new Date(new Date(l.start).getTime() - 60_000).toISOString() // ~1 min early
      const bot = await createBot(l.meetingUrl, 'Lesson Recorder', joinAt)
      await saveBot({ eventId: l.id, botId: bot.id, status: bot.status, meetingUrl: l.meetingUrl, createdAt: Date.now() })
      scheduled.push(l.title)
    } catch (e: any) {
      skipped.push({ title: l.title, reason: `bot failed: ${e?.message ?? 'error'}` })
    }
  }

  return NextResponse.json({ ok: true, scheduled: scheduled.length, scheduledTitles: scheduled, skipped })
}
