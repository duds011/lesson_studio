import { NextRequest, NextResponse } from 'next/server'
import { exchangeZoomCode } from '@/lib/zoom'

// Build the public base URL, honoring ngrok / proxy forwarding headers.
function publicBase(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const base = publicBase(req)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) return NextResponse.redirect(`${base}/?zoom=denied`)
  if (!code) return NextResponse.redirect(`${base}/?zoom=error`)

  try {
    await exchangeZoomCode(code)
    return NextResponse.redirect(`${base}/?zoom=ok`)
  } catch (e) {
    console.error('Zoom callback failed:', e)
    return NextResponse.redirect(`${base}/?zoom=error`)
  }
}
