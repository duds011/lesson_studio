import { createClient } from '@/lib/supabase/server'

/**
 * The logged-in teacher's id (their Supabase auth user id) — the tenant key for
 * all per-teacher state. Returns null if there's no session. Teacher pages/routes
 * are already gated by middleware; this just reads the id to scope KV access.
 */
export async function getTeacherId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}
