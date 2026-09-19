'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { currentUser } from '@/lib/auth'
import { isLocale, LOCALES } from '@/lib/i18n/config'

export type LanguageResult = { success: boolean; error?: string }

/**
 * Whoever is signed in chooses what language the app speaks to them in.
 *
 * Teachers and students both, and deliberately the same action: they both have
 * a profiles row, the column is on it, and a student's reason for wanting an
 * English interface around a French recap is no different from a teacher's.
 *
 * Written through the user's own client rather than the admin one: someone
 * updating one column on their own profile row is exactly what RLS is for,
 * and there is nothing here worth bypassing it to do.
 *
 * The value is checked against LOCALES before it is stored, and the column
 * has the same list as a CHECK constraint. Two guards for one value is not
 * belt and braces — free text that reaches getDict falls back to English
 * silently, which looks like the feature is broken rather than like the input
 * was wrong.
 */
export async function setUiLanguage(language: string): Promise<LanguageResult> {
  const supabase = await createClient()
  const user = await currentUser(supabase)
  if (!user) return { success: false, error: 'Sign in first.' }

  const wanted = String(language ?? '').trim()
  if (!isLocale(wanted)) {
    return { success: false, error: `Pick one of: ${LOCALES.join(', ')}.` }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ ui_language: wanted })
    .eq('id', user.id)

  if (error) {
    console.error('[ui-language] setUiLanguage:', error.message)
    return { success: false, error: 'We could not save that just now. Try again in a moment.' }
  }

  // Every page reads the locale in its layout, so the whole app has to
  // re-render — not just this one route — or the teacher changes the language
  // and the nav beside them stays in the old one until they navigate.
  revalidatePath('/', 'layout')
  return { success: true }
}
