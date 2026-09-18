'use server'

import { createClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/auth'
import { cleanNote, cleanReasons } from '@/lib/ratings'

export type RateResult = { ok: boolean; error?: string }

/**
 * Record what the student thought of a recap.
 *
 * Written through the student's own client so RLS decides what may be rated:
 * the insert policy checks that the lesson belongs to a students row whose
 * profile_id is this session. Sending somebody else's lesson id fails in the
 * database rather than being caught by a check here that could be forgotten.
 *
 * The teacher can read these and can never write or delete one — also in the
 * policy. A rating of someone's work that the same person can edit is not a
 * rating, and this table is the only place the student's own view of the
 * write-up exists.
 */
export async function rateRecap(input: {
  lessonId: string
  matched: boolean
  reasons?: string[]
  note?: string
}): Promise<RateResult> {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return { ok: false, error: 'Sign in first.' }

  const lessonId = String(input.lessonId ?? '').trim()
  if (!lessonId) return { ok: false, error: 'Missing lesson.' }

  // Reasons belong to "Not quite" only — a Yes carrying them is stale form
  // state from someone who opened the list and then changed their mind.
  const matched = input.matched === true
  const reasons = matched ? [] : cleanReasons(input.reasons)
  const note = matched ? null : cleanNote(input.note)

  const { error } = await supabase.from('recap_ratings').upsert(
    {
      lesson_id: lessonId,
      user_id: user.id,
      matched,
      reasons,
      note,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'lesson_id,user_id' },
  )

  if (error) {
    console.error('[rate-recap]', error.message)
    return { ok: false, error: 'We could not save that just now. Try again in a moment.' }
  }

  return { ok: true }
}
