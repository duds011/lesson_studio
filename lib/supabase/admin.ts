import { createClient } from '@supabase/supabase-js'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

/**
 * Admin client — uses the service role key, bypasses RLS.
 * Only import this in Server Actions or API routes — NEVER in client components.
 */
export function createAdminClient() {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY)

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase admin credentials')
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    // PostgREST reads are plain GETs, and Next.js keeps those in a Data Cache
    // that outlives the deployment. A query first issued while a table was
    // empty then kept answering empty: the extension's student list stayed
    // blank long after the student existed, and redeploying did not clear it.
    // Admin reads are always live data, so never serve them from a cache.
    global: { fetch: (input: any, init?: any) => fetch(input, { ...(init || {}), cache: 'no-store' }) },
  })
}
