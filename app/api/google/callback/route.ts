import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode } from '@/lib/google'
import { getTeacherId } from '@/lib/current-teacher'

// Public base URL, honoring ngrok / proxy forwarding headers.
function publicBase(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

// Google redirects here after the teacher approves (or denies).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const base = publicBase(req)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) return NextResponse.redirect(`${base}/?connected=denied`)
  if (!code) return NextResponse.redirect(`${base}/?connected=error`)

  const teacherId = await getTeacherId()
  if (!teacherId) return NextResponse.redirect(`${base}/login`)

  try {
    await exchangeCode(code, teacherId)
    return NextResponse.redirect(`${base}/?connected=ok`)
  } catch (e) {
    console.error('OAuth callback failed:', e)
    return NextResponse.redirect(`${base}/?connected=error`)
  }
}
