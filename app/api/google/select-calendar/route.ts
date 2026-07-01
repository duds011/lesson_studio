import { NextRequest, NextResponse } from 'next/server'
import { setSelectedCalendar } from '@/lib/store'
import { publicBase } from '@/lib/url'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const id = String(form.get('calendarId') || '')
  const name = String(form.get('calendarName') || '')
  if (id) await setSelectedCalendar(id, name)
  return NextResponse.redirect(`${publicBase(req)}/`, { status: 303 })
}
