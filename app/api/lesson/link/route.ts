import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mapEventToStudent } from '@/lib/lesson-link'

export const dynamic = 'force-dynamic'

async function teacher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'auth' as const }
  const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (p?.role !== 'teacher') return { error: 'role' as const }
  return { supabase, user }
}

// GET ?eventId=&attendees=a,b → teacher's students + current + auto-matched link.
export async function GET(req: Request) {
  const t = await teacher()
  if ('error' in t) return NextResponse.json({ ok: false }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('eventId') || ''
  const attendees = (searchParams.get('attendees') || '').split(',').map((s) => s.trim()).filter(Boolean)

  const [{ data: students }, { data: link }, auto] = await Promise.all([
    t.supabase.from('students').select('id, full_name, email, profile_id').eq('teacher_id', t.user.id).order('full_name'),
    t.supabase.from('lesson_event_links').select('student_id').eq('event_id', eventId).maybeSingle(),
    mapEventToStudent(t.supabase, eventId, attendees),
  ])

  return NextResponse.json({
    ok: true,
    students: (students ?? []).map((s: any) => ({ id: s.id, name: s.full_name, hasLogin: Boolean(s.profile_id) })),
    linkedStudentId: link?.student_id ?? null,
    autoStudentId: auto?.studentId ?? null,
  })
}

// POST { eventId, studentId } → set (or clear when studentId is null) the link.
export async function POST(req: Request) {
  const t = await teacher()
  if ('error' in t) return NextResponse.json({ ok: false }, { status: 401 })
  const { eventId, studentId } = await req.json()
  if (!eventId) return NextResponse.json({ ok: false, error: 'Missing eventId' }, { status: 400 })

  if (!studentId) {
    await t.supabase.from('lesson_event_links').delete().eq('event_id', eventId)
    return NextResponse.json({ ok: true, studentId: null })
  }
  // Confirm the student belongs to this teacher, then link.
  const { data: s } = await t.supabase.from('students').select('id').eq('id', studentId).eq('teacher_id', t.user.id).single()
  if (!s) return NextResponse.json({ ok: false, error: 'Student not found' }, { status: 404 })
  const { error } = await t.supabase.from('lesson_event_links').upsert(
    { event_id: eventId, teacher_id: t.user.id, student_id: studentId },
    { onConflict: 'event_id' },
  )
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, studentId })
}
