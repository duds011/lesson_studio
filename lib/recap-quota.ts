/**
 * How many recaps one teacher may generate.
 *
 * Signup is open to anyone, and a recap is the most expensive thing this app
 * does — a Whisper transcription of two full-length tracks plus a very large
 * OpenAI completion. lib/lesson-limits caps what a single recap can cost; this
 * caps how many of them a single account can run.
 *
 * Two shapes of account:
 * - profiles.recap_monthly_limit set  → a paid plan; the count resets monthly.
 * - profiles.recap_monthly_limit NULL → a free trial: 3 recaps TOTAL, counted
 *   all-time, so a new account can taste the product and nothing more.
 *   Existing accounts were all set to the Studio plan (migration 0023), so
 *   NULL genuinely means "signed up and never subscribed".
 */
import { createAdminClient } from '@/lib/supabase/admin'

/** Free recaps a brand-new account gets before choosing a plan. All-time. */
export const TRIAL_RECAPS = Number(process.env.TRIAL_RECAPS || 3)

/** First instant of the current month, UTC — the window paid plans count in. */
function monthStart(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

export type RecapUsage = {
  used: number
  limit: number
  left: number
  trial: boolean
  /** Purchased top-up recaps still unspent. Never expire; counted in `left`. */
  extra: number
}

async function countUsage(teacherId: string): Promise<RecapUsage & { error: boolean }> {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles').select('recap_monthly_limit, recap_topup_credits').eq('id', teacherId).maybeSingle()

  const planLimit = (profile as any)?.recap_monthly_limit ?? null
  const trial = planLimit == null
  const limit = trial ? TRIAL_RECAPS : planLimit
  // Top-ups are a paid-plan concept; a trial that wants more picks a plan.
  const extra = trial ? 0 : Math.max(0, (profile as any)?.recap_topup_credits ?? 0)

  let query = admin
    .from('recap_runs')
    .select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId)
  // A plan's allowance renews each month; trial recaps never do.
  if (!trial) query = query.gte('created_at', monthStart())
  const { count, error } = await query

  const used = error ? 0 : (count ?? 0)
  return { used, limit, left: Math.max(0, limit - used) + extra, trial, extra, error: Boolean(error) }
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
  const u = await countUsage(teacherId)
  if (u.error) {
    console.warn('[recap-quota] could not count usage, allowing')
    return { ok: true, used: 0, limit: u.limit }
  }
  // `left` already includes unspent top-ups for paid plans.
  if (u.left > 0) return { ok: true, used: u.used, limit: u.limit }

  return {
    ok: false,
    message: u.trial
      ? `Your ${u.limit} free trial recaps are used. Pick a plan in Settings → Subscription to keep going.`
      : `You have built ${u.used} recaps this month, which is your plan's limit. Add 5 extra recaps or move to a bigger plan in Settings → Subscription — the monthly count resets on the 1st.`,
  }
}

/**
 * The same count as checkRecapQuota, but always with numbers — for showing a
 * teacher where they stand rather than deciding whether a build may run.
 */
export async function getRecapUsage(teacherId: string): Promise<RecapUsage> {
  const { error: _err, ...usage } = await countUsage(teacherId)
  return usage
}

/**
 * Record a generation. Called AFTER the model has been paid for, so a run that
 * failed before reaching OpenAI does not count against the teacher.
 */
export async function recordRecapRun(teacherId: string, source: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('recap_runs').insert({ teacher_id: teacherId, source })
  // Never fatal: the recap is already built and paid for, and losing the tally
  // is a smaller problem than throwing away a finished lesson.
  if (error) console.warn('[recap-quota] could not record run:', error.message)

  /**
   * Spend a top-up only when this run landed beyond the plan's month.
   *
   * The monthly allowance is a window that resets; top-ups are a purse that
   * doesn't. So the purse is only opened once the window is spent — a teacher
   * who buys 5 mid-month and then has the month roll over keeps all 5.
   */
  try {
    const { data: profile } = await admin
      .from('profiles').select('recap_monthly_limit, recap_topup_credits').eq('id', teacherId).maybeSingle()
    const planLimit = (profile as any)?.recap_monthly_limit ?? null
    const credits = (profile as any)?.recap_topup_credits ?? 0
    if (planLimit == null || credits <= 0) return // trials have no purse

    const { count } = await admin
      .from('recap_runs')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', teacherId)
      .gte('created_at', monthStart())
    if ((count ?? 0) > planLimit) {
      await admin.from('profiles').update({ recap_topup_credits: credits - 1 }).eq('id', teacherId)
    }
  } catch (e: any) {
    console.warn('[recap-quota] could not settle top-up credit:', e?.message)
  }
}
