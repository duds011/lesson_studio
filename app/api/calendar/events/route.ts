import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listLessonsInRange } from '@/lib/google'
import { getBots, getRecaps } from '@/lib/store'
import { friendlyStatus } from '@/lib/recall'

export const dynamic = 'force-dynamic'

// Teacher-only: events on the connected calendar within [from,to], enriched
// with recorder-bot + recap state so the calendar grid can show status and
// open the full LessonRow actions. Guarded via Supabase auth (the /api/*
// routes are outside the auth middleware).
export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  if (!from || !to) return NextResponse.json({ ok: false, error: 'Missing range' }, { status: 400 })

  try {
    const [lessons, botRecs, recapRecs] = await Promise.all([listLessonsInRange(from, to), getBots(), getRecaps()])
    const items = lessons.map((l) => {
      const rec = botRecs[l.id]
      const bot = rec ? { botId: rec.botId, status: rec.status, ...(() => { const f = friendlyStatus(rec.status); return { label: f.label, state: f.state } })() } : null
      return { ...l, bot, recapStatus: recapRecs[l.id]?.status ?? null }
    })
    return NextResponse.json({ ok: true, lessons: items })
  } catch (e: any) {
    if (e?.message === 'SCOPE') return NextResponse.json({ ok: false, error: 'SCOPE' }, { status: 200 })
    return NextResponse.json({ ok: false, error: e?.message ?? 'Failed to load calendar' }, { status: 500 })
  }
}
