import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { scopedTeacherId } from './teacher-scope'

/**
 * Resolves whose runtime data we are reading or writing.
 *
 * Order: an explicit `runAsTeacher` scope wins (cron, public booking), then
 * the signed-in teacher. Deliberately returns null for a signed-in *student*
 * — a student must never reach teacher docs.
 */

// Deduped per request by React cache, so the profile lookup happens once even
// though the store calls this on every read.
const sessionTeacherId = cache(async (): Promise<string | null> => {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    return profile?.role === 'teacher' ? user.id : null
  } catch {
    return null
  }
})

export async function getTeacherId(): Promise<string | null> {
  return scopedTeacherId() ?? (await sessionTeacherId())
}

export async function requireTeacherId(): Promise<string> {
  const id = await getTeacherId()
  if (!id) {
    throw new Error(
      'No teacher in scope. Signed-in teacher requests resolve automatically; ' +
      'cron and public booking must wrap their work in runAsTeacher().'
    )
  }
  return id
}

/** Every teacher id, for jobs that must sweep the whole workspace (cron). */
export async function listTeacherIds(): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('id').eq('role', 'teacher')
  return (data ?? []).map((r: any) => r.id)
}

/**
 * Who the PUBLIC booking page books with. Explicit `?t=` wins, then an env
 * override, then — only when the workspace has exactly one teacher — that
 * teacher. With several teachers and no hint we refuse rather than guess.
 */
export async function resolveBookingTeacherId(hint?: string | null): Promise<string | null> {
  if (hint) return hint
  if (process.env.DEFAULT_TEACHER_ID) return process.env.DEFAULT_TEACHER_ID
  const ids = await listTeacherIds()
  return ids.length === 1 ? ids[0] : null
}
