'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { currentUser } from '@/lib/auth'
import { TEACHING_LANGUAGES } from '@/lib/languages'

export type PrefResult = { success: boolean; error?: string }

/**
 * The student decides what their own recaps are written in.
 *
 * This used to be the teacher's setting alone — students.instruction_language,
 * edited from the teacher's page — which quietly assumed the teacher knows
 * which language their student reads most comfortably. Often they do not: a
 * Brazilian learning French from a French teacher who speaks English to them
 * gets English explanations by default, and nobody involved ever chose that.
 *
 * Lesson Journal has always worked this way (the learner sets their own
 * native_language at signup) — this brings the teacher's product to the same
 * place.
 *
 * Written with the admin client and an explicit `profile_id = user.id` filter
 * rather than through RLS, on purpose. RLS would need an UPDATE policy on the
 * whole `students` row, and that row also carries teacher_id, level and the
 * target language — a student could then rewrite any of them. Postgres cannot
 * scope a policy to two columns; this update can, because it names them.
 */
export async function setMyRecapLanguage(language: string): Promise<PrefResult> {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return { success: false, error: 'Sign in first.' }

  const wanted = String(language ?? '').trim()
  if (!wanted) return { success: false, error: 'Pick a language.' }

  /**
   * Only a language the recap prompts can actually write.
   *
   * Free text here would reach lib/openai as an instruction to produce
   * explanations in something nobody tested — "Klingon", or a typo that the
   * model quietly interprets. The picker offers this list; this is the check
   * that the request came from the picker.
   */
  const match = TEACHING_LANGUAGES.find((l) => l.toLowerCase() === wanted.toLowerCase())
  if (!match) return { success: false, error: 'That is not one of the languages we can write in yet.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('students')
    .update({ instruction_language: match, instruction_language_set_by: 'student' })
    .eq('profile_id', user.id)

  if (error) {
    console.error('[student-prefs] setMyRecapLanguage:', error.message)
    return { success: false, error: 'We could not save that just now. Try again in a moment.' }
  }

  return { success: true }
}
