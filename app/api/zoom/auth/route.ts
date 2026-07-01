import { NextResponse } from 'next/server'
import { buildZoomAuthUrl, isZoomConfigured } from '@/lib/zoom'

export async function GET() {
  if (!isZoomConfigured()) {
    return NextResponse.json(
      { error: 'Zoom OAuth not configured. Set ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET in .env' },
      { status: 500 }
    )
  }
  const state = Math.random().toString(36).slice(2)
  return NextResponse.redirect(buildZoomAuthUrl(state))
}
