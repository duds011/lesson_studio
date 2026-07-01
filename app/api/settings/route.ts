import { NextRequest, NextResponse } from 'next/server'
import { setPlatform, type Platform } from '@/lib/settings'
import { publicBase } from '@/lib/url'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const platform = String(form.get('platform') || '') as Platform
  if (platform === 'google_meet' || platform === 'zoom') await setPlatform(platform)
  return NextResponse.redirect(`${publicBase(req)}/`, { status: 303 })
}
