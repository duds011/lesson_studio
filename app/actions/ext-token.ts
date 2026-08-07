'use server'

import { randomBytes } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentUser } from '@/lib/auth'

export type TokenResult = { success: boolean; token?: string; error?: string }

/**
 * Issue (or replace) this teacher's recorder token.
 *
 * Replacing is the way to revoke: the row is keyed on the teacher, so a new
 * token overwrites the old one and any extension still holding it stops
 * working on its next call.
 */
export async function rotateExtToken(): Promise<TokenResult> {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return { success: false, error: 'Not signed in' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return { success: false, error: 'Teachers only' }

  // 32 bytes of randomness, url-safe so it survives being copied around.
  const token = randomBytes(32).toString('base64url')

  const admin = createAdminClient()
  const { error } = await admin
    .from('teacher_ext_tokens')
    .upsert({ teacher_id: user.id, token, created_at: new Date().toISOString(), last_used_at: null },
      { onConflict: 'teacher_id' })
  if (error) return { success: false, error: error.message }

  revalidatePath('/settings')
  return { success: true, token }
}
