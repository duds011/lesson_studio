import { NextRequest, NextResponse } from 'next/server'
import { clearToken } from '@/lib/store'
import { publicBase } from '@/lib/url'

export async function POST(req: NextRequest) {
  await clearToken()
  return NextResponse.redirect(`${publicBase(req)}/`, { status: 303 })
}
