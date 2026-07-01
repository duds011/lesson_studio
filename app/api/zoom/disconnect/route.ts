import { NextRequest, NextResponse } from 'next/server'
import { clearZoomToken } from '@/lib/store'
import { publicBase } from '@/lib/url'

export async function POST(req: NextRequest) {
  await clearZoomToken()
  return NextResponse.redirect(`${publicBase(req)}/`, { status: 303 })
}
