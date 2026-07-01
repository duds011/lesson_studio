import { NextResponse } from 'next/server'
import { buildAuthUrl, isConfigured } from '@/lib/google'

// Kicks off the Google consent flow.
export async function GET() {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' },
      { status: 500 }
    )
  }
  const state = Math.random().toString(36).slice(2)
  return NextResponse.redirect(buildAuthUrl(state))
}
