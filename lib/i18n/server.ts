import 'server-only'
import { cookies, headers } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeForTeachingLanguage,
  matchAcceptLanguage,
  type Locale,
} from './config'

/**
 * A whole server pinned to one language, for looking at it.
 *
 * Exists because the locale belongs to the PERSON, which is the right design
 * and makes the app impossible to survey: you would have to keep editing a
 * profile row, or a cookie that every port on localhost shares, to see the
 * same page in three languages.
 *
 * Refuses to work on Vercel. A forced locale would override every teacher's
 * own setting at once, which is the one thing this feature exists to
 * prevent. The guard is VERCEL rather than NODE_ENV on purpose: `next start`
 * runs with NODE_ENV=production locally, so a NODE_ENV guard would switch
 * this off in exactly the place it is meant to work and stay off nowhere
 * that matters.
 *
 *   KOKU_LOCALE=ja npx next start -p 3403
 */
function forcedLocale(): Locale | null {
  if (process.env.VERCEL) return null
  const v = process.env.KOKU_LOCALE
  return isLocale(v) ? v : null
}

/**
 * Which language to render this request in.
 *
 * The app is signed in and server-rendered per request, so the locale does
 * not belong in the URL the way it does on the marketing site. It belongs to
 * the person. That also means no /es/... routes to add, no redirects, and no
 * link in the app that has to know about language.
 *
 * Teacher and student resolve differently on purpose — see each function.
 */

/**
 * A teacher's own choice, then their browser's.
 *
 * profiles.ui_language is null until they pick one, and the browser header is
 * a far better first guess than English for someone who just arrived from a
 * seven-language website. It is only ever a GUESS though: the moment they set
 * the picker in Settings, the column wins on every device.
 */
export async function teacherLocale(
  supabase: SupabaseClient,
  userId: string,
): Promise<Locale> {
  const forced = forcedLocale()
  if (forced) return forced

  const { data } = await supabase
    .from('profiles')
    .select('ui_language')
    .eq('id', userId)
    .maybeSingle()

  const saved = (data as { ui_language?: string | null } | null)?.ui_language
  if (isLocale(saved)) return saved
  return (await acceptLanguageLocale()) ?? DEFAULT_LOCALE
}

/**
 * A student's portal follows the language their recaps are written in.
 *
 * They already answered this question — students.instruction_language is "the
 * language I read most comfortably", which they set themselves. Asking a
 * second time would create two settings that can disagree, and the state
 * where your recap is in Portuguese and the page around it is in English is
 * exactly the one this feature exists to remove.
 *
 * That column holds one of the twenty-seven teaching languages, most of which
 * have no interface. Anything we cannot render falls through to the browser
 * and then to English.
 */
export async function studentLocale(
  admin: SupabaseClient,
  userId: string,
): Promise<Locale> {
  const forced = forcedLocale()
  if (forced) return forced

  const { data } = await admin
    .from('students')
    .select('instruction_language')
    .eq('profile_id', userId)
    .maybeSingle()

  const fromRecaps = localeForTeachingLanguage(
    (data as { instruction_language?: string | null } | null)?.instruction_language,
  )
  if (fromRecaps) return fromRecaps
  return (await acceptLanguageLocale()) ?? DEFAULT_LOCALE
}

/** The browser's preference, for anyone we do not have a stored answer for. */
export async function acceptLanguageLocale(): Promise<Locale | null> {
  try {
    const h = await headers()
    return matchAcceptLanguage(h.get('accept-language'))
  } catch {
    // Called outside a request scope. Not fatal — the caller falls back.
    return null
  }
}

/**
 * Signed-out pages: login, signup, a reset link, a booking page.
 *
 * There is no profile to read, so the order is: what they picked on one of
 * these pages, then what their browser asks for, then English. The cookie
 * comes first because it is an actual decision and the header is a guess —
 * somebody who switched to Japanese on the login screen has said something
 * their Accept-Language header did not.
 */
export async function publicLocale(): Promise<Locale> {
  const forced = forcedLocale()
  if (forced) return forced

  try {
    const jar = await cookies()
    const picked = jar.get(LOCALE_COOKIE)?.value
    if (isLocale(picked)) return picked
  } catch {
    // Outside a request scope; fall through to the header, then English.
  }
  return (await acceptLanguageLocale()) ?? DEFAULT_LOCALE
}
