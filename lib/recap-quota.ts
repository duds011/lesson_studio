/**
 * How many recaps one teacher may still generate.
 *
 * Signup is open to anyone and a recap is the most expensive thing this app
 * does — a Whisper transcription of two full-length tracks plus a very large
 * completion. lib/lesson-limits caps what one recap can cost; this caps how
 * many an account can run.
 *
 * It used to be two shapes at once: a monthly allowance that reset on the 1st,
 * plus a purse of top-up credits that only opened once the allowance was
 * spent. That meant two ways to be out of recaps, two messages saying so, and
 * a settlement routine that had to work out which pocket a run came from.
 *
 * Now there is one number. profiles.recap_credits is the balance, a new
 * account opens with three, and a pack adds to it. Nothing resets and nothing
 * expires, so "how many have I got left" has exactly one answer.
 *
 * recap_runs is still written for every generation, but as history — it no
 * longer decides anything.
 */
import { createAdminClient } from '@/lib/supabase/admin'
import { TRIAL_RECAPS } from '@/lib/plans'

export { TRIAL_RECAPS }

export type RecapUsage = {
  /** Write-ups built, all time. History, not a limit. */
  used: number
  /** Write-ups still available. */
  left: number
  /**
   * True while the account is still on its opening balance and has never
   * bought a pack. Only changes the wording when the balance runs out.
   */
  trial: boolean
}

async function readUsage(teacherId: string): Promise<RecapUsage & { error: boolean }> {
  const admin = createAdminClient()

  const [{ data: profile, error: profileError }, { count, error: countError }] = await Promise.all([
    admin.from('profiles').select('recap_credits, plan_id').eq('id', teacherId).maybeSingle(),
    admin.from('recap_runs').select('id', { count: 'exact', head: true }).eq('teacher_id', teacherId),
  ])

  const left = Math.max(0, Number((profile as any)?.recap_credits ?? 0))
  const used = countError ? 0 : (count ?? 0)
  // plan_id is written by the webhook on the first purchase and never cleared,
  // so it is the record of "has bought at least once" now that it no longer
  // names a subscription tier.
  const trial = !(profile as any)?.plan_id

  return { used, left, trial, error: Boolean(profileError) }
}

export type QuotaCheck = { ok: true; left: number } | { ok: false; message: string }

/**
 * Whether this teacher may generate another recap right now.
 *
 * Fails OPEN: if reading the balance errors, the recap proceeds. A quota
 * guards against abuse, and letting a database hiccup swallow a lesson a
 * teacher actually taught costs more than it saves.
 */
export async function checkRecapQuota(teacherId: string): Promise<QuotaCheck> {
  const u = await readUsage(teacherId)
  if (u.error) {
    console.warn('[recap-quota] could not read balance, allowing')
    return { ok: true, left: 0 }
  }
  if (u.left > 0) return { ok: true, left: u.left }

  return {
    ok: false,
    message: u.trial
      ? `Your ${TRIAL_RECAPS} free write-ups are used. Packs start at $30 for 20 — Settings → Lessons.`
      : 'You have no write-ups left. Add more in Settings → Lessons; they never expire.',
  }
}

/** The same numbers, for showing a teacher where they stand. */
export async function getRecapUsage(teacherId: string): Promise<RecapUsage> {
  const { error: _err, ...usage } = await readUsage(teacherId)
  return usage
}

/**
 * Record a generation and spend one credit.
 *
 * Called AFTER the model has been paid for, so a run that failed before
 * reaching OpenAI costs the teacher nothing.
 *
 * The decrement is one guarded statement rather than read-then-write:
 * ext/complete builds in the background, and a teacher can have two lessons
 * finish within a second of each other — exactly the shape that loses a credit,
 * or hands out a free one, when both reads see the same balance. Doing it in
 * SQL also makes the floor the database's job rather than ours.
 */
export async function recordRecapRun(teacherId: string, source: string): Promise<void> {
  const admin = createAdminClient()

  const { error } = await admin.from('recap_runs').insert({ teacher_id: teacherId, source })
  // Never fatal: the recap is already built and paid for, and losing the tally
  // is a smaller problem than throwing away a finished lesson.
  if (error) console.warn('[recap-quota] could not record run:', error.message)

  const { error: spendError } = await admin.rpc('spend_recap_credit', { teacher: teacherId })
  if (spendError) console.warn('[recap-quota] could not spend credit:', spendError.message)
}
