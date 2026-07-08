import { NextRequest, NextResponse } from 'next/server'
import { clearZoomToken } from '@/lib/store'
import { publicBase } from '@/lib/url'
import { getTeacherId } from '@/lib/current-teacher'

export async function POST(req: NextRequest) {
  const teacherId = await getTeacherId()
  if (teacherId) await clearZoomToken(teacherId)
  return NextResponse.redirect(`${publicBase(req)}/`, { status: 303 })
}
