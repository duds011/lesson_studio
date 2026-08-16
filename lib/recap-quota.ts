/**
 * How many recaps one teacher may generate in a calendar month.
 *
 * Signup is open to anyone, and a recap is the most expensive thing this app
 * does — a Whisper transcription of two full-length tracks plus a very large
 * OpenAI completion. lib/lesson-limits caps what a single recap can cost; this
 * caps how many of them a single account can run.
 *
 * The number is deliberately far above real teaching. Someone teaching thirty
 * hours a week lands near 120 a month, so the ceiling only ever bites on
 * something that is not teaching.
 */
import { createAdminClient } from '@/lib/supabase/admin'

/** Overridable per teacher (profiles.recap_monthly_limit) and per deploy. */
export const DEFAULT_RECAP_MONTHLY_LIMIT = Number(process.env.RECAP_MONTHLY_LIMIT || 200)

/** First instant of the current month, UTC — the window everything counts in. */
function monthStart(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

export type QuotaCheck = { ok: true; used: number; limit: number } | { ok: false; message: string }

/**
 * Whether this teacher may generate another recap right now.
 *
 * Fails OPEN: if the count itself errors, the recap proceeds. A quota is a
 * guard against abuse, and letting a database hiccup swallow a lesson a
 * teacher actually taught would cost more than it saves.
 */
export async function checkRecapQuota(teacherId: string): Promise<QuotaCheck> {
  const admin = createAdminClient()

  const [{ data: profile }, { count, error }] = await Promise.all([
    admin.from('profiles').select('recap_monthly_limit').eq('id', teacherId).maybeSingle(),
    admin
      .from('recap_runs')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .gte('created_at', monthStart()),
  ])

  if (error) {
    console.warn('[recap-quota] could not count usage, allowing:', error.message)
    return { ok: true, used: 0, limit: DEFAULT_RECAP_MONTHLY_LIMIT }
  }

  const limit = (profile as any)?.recap_monthly_limit ?? DEFAULT_RECAP_MONTHLY_LIMIT
  const used = count ?? 0
  if (used < limit) return { ok: true, used, limit }

  return {
    ok: false,
    message: `You have built ${used} recaps this month, which is the limit on this account. It resets at the start of next month — get in touch if you need it raised.`,
  }
}

/**
 * Record a generation. Called AFTER the model has been paid for, so a run that
 * failed before reaching OpenAI does not count against the teacher.
 */
export async function recordRecapRun(teacherId: string, source: string): Promise<void> {
  const { error } = await createAdminClient().from('recap_runs').insert({ teacher_id: teacherId, source })
  // Never fatal: the recap is already built and paid for, and losing the tally
  // is a smaller problem than throwing away a finished lesson.
  if (error) console.warn('[recap-quota] could not record run:', error.message)
}
