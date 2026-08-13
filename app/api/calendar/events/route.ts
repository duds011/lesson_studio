import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listLessonsInRange } from '@/lib/google'
import { getRecaps } from '@/lib/store'

export const dynamic = 'force-dynamic'

// Teacher-only: events on the connected calendar within [from,to], enriched
// with recap state so the calendar grid can show status and open the full
// LessonRow actions. Guarded via Supabase auth (the /api/* routes are outside
// the auth middleware).
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
    const [lessons, recapRecs] = await Promise.all([listLessonsInRange(from, to), getRecaps()])
    // Same narrowing as the overview: the calendar has no dot for a recap that
    // is still building or that failed — the review queue owns those.
    const st = (v?: string | null) => (v === 'draft' || v === 'published' ? v : null)
    const items = lessons.map((l) => ({ ...l, recapStatus: st(recapRecs[l.id]?.status) }))
    return NextResponse.json({ ok: true, lessons: items })
  } catch (e: any) {
    if (e?.message === 'SCOPE') return NextResponse.json({ ok: false, error: 'SCOPE' }, { status: 200 })
    return NextResponse.json({ ok: false, error: e?.message ?? 'Failed to load calendar' }, { status: 500 })
  }
}
