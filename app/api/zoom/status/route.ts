import { NextResponse } from 'next/server'
import { isZoomConfigured, zoomConnection } from '@/lib/zoom'

export const dynamic = 'force-dynamic'

export async function GET() {
  const configured = isZoomConfigured()
  if (!configured) return NextResponse.json({ configured: false, connected: false })
  const conn = await zoomConnection()
  return NextResponse.json({ configured: true, ...conn })
}
