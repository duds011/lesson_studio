import { NextResponse } from 'next/server'
import { isZoomConfigured, zoomConnection } from '@/lib/zoom'
import { getTeacherId } from '@/lib/current-teacher'

export const dynamic = 'force-dynamic'

export async function GET() {
  const configured = isZoomConfigured()
  if (!configured) return NextResponse.json({ configured: false, connected: false })
  const teacherId = await getTeacherId()
  if (!teacherId) return NextResponse.json({ configured: true, connected: false })
  const conn = await zoomConnection(teacherId)
  return NextResponse.json({ configured: true, ...conn })
}
