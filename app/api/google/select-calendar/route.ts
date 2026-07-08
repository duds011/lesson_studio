import { NextRequest, NextResponse } from 'next/server'
import { setSelectedCalendar } from '@/lib/store'
import { publicBase } from '@/lib/url'
import { getTeacherId } from '@/lib/current-teacher'

export async function POST(req: NextRequest) {
  const teacherId = await getTeacherId()
  if (!teacherId) return NextResponse.redirect(`${publicBase(req)}/login`, { status: 303 })
  const form = await req.formData()
  const id = String(form.get('calendarId') || '')
  const name = String(form.get('calendarName') || '')
  if (id) await setSelectedCalendar(teacherId, id, name)
  const back = req.headers.get('referer')?.includes('/settings') ? '/settings' : '/'
  return NextResponse.redirect(`${publicBase(req)}${back}`, { status: 303 })
}
