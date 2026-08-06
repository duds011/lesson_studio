import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Guaranteed sign-out: clears the Supabase session cookies server-side and
// sends the user to /login. Reachable directly at /logout (GET) as an escape
// hatch, and used by the nav "Sign out" links. Not in the middleware matcher,
// so it is never bounced back to the app.
async function handle(request: Request) {
  // A prefetch is not a click. Next's <Link> and some browsers fetch a GET
  // ahead of time, and honouring one of those here revokes the session the
  // student just opened — they get signed out seconds after signing in.
  const h = request.headers
  const isPrefetch =
    h.has('next-router-prefetch') ||
    h.get('purpose') === 'prefetch' ||
    (h.get('sec-purpose') ?? '').includes('prefetch') ||
    h.get('x-middleware-prefetch') === '1'
  if (isPrefetch) return new NextResponse(null, { status: 204 })

  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 })
}

export const GET = handle
export const POST = handle
