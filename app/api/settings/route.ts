import { NextRequest, NextResponse } from 'next/server'
import { setPlatform, type Platform } from '@/lib/settings'
import { publicBase } from '@/lib/url'
import { getTeacherId } from '@/lib/current-teacher'

export async function POST(req: NextRequest) {
  const teacherId = await getTeacherId()
  if (!teacherId) return NextResponse.redirect(`${publicBase(req)}/login`, { status: 303 })
  const form = await req.formData()
  const platform = String(form.get('platform') || '') as Platform
  if (platform === 'google_meet' || platform === 'zoom') await setPlatform(teacherId, platform)
  const back = req.headers.get('referer')?.includes('/settings') ? '/settings' : '/'
  return NextResponse.redirect(`${publicBase(req)}${back}`, { status: 303 })
}
