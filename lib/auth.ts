import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Who is signed in, for a page whose area the middleware has already gated.
 *
 * `getUser()` asks the auth server every time. A slow round trip, a cold
 * start, or a refresh token that rotates between the middleware and this
 * render all come back as "no user" on a request that is carrying a perfectly
 * good session — and every caller of it turns that into a redirect, so a
 * signed-in student clicking a lesson lands on the login page.
 *
 * The cookie is read as a second opinion before giving up. It is only trusted
 * for *routing*: every query on the page still runs through RLS as whoever the
 * token really is, so a forged cookie gets a page with nothing in it rather
 * than someone else's lesson.
 */
export async function currentUser(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return user
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

/** As above, but sends them to sign in — and back here afterwards. */
export async function requireUser(supabase: SupabaseClient, returnTo?: string) {
  const user = await currentUser(supabase)
  if (!user) redirect(returnTo ? `/login?next=${encodeURIComponent(returnTo)}&expired=1` : '/login')
  return user
}
