'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { setPlatform, type Platform } from '@/lib/settings'
import { linkPlatformFor, isTeachingPlatform, type TeachingPlatform } from '@/lib/teaching-platform'
import { isCalendarMode, type CalendarMode } from '@/lib/calendar-mode'
import { resolveBrand, type Brand } from '@/lib/brand'
import { DEFAULT_LOCALE, localeForTeachingLanguage } from '@/lib/i18n/config'

type Result = { success: boolean; error?: string }

/** The teacher currently signed in, or null. */
async function currentTeacher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_completed_at')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'teacher') return null
  return { supabase, userId: user.id, setUp: Boolean(profile.onboarding_completed_at) }
}

export type OnboardingPatch = {
  teachingLanguage?: string
  /** What the teacher explains in — not necessarily what they teach. */
  speakingLanguage?: string
  timezone?: string
  teachingPlatform?: TeachingPlatform
  calendarMode?: CalendarMode
  step?: number
  brand?: Partial<Brand>
}

/**
 * Save one onboarding step. Called after each step so a teacher who drops out
 * halfway resumes where they left off rather than starting over.
 */
export async function saveOnboarding(patch: OnboardingPatch): Promise<Result> {
  const ctx = await currentTeacher()
  if (!ctx) return { success: false, error: 'Not signed in as a teacher' }
  const { supabase, userId, setUp } = ctx

  const update: Record<string, unknown> = {}
  if (typeof patch.teachingLanguage === 'string') {
    const name = patch.teachingLanguage.trim().slice(0, 60)
    update.teaching_language = name || null

    /**
     * The teaching language decides what language the workspace is in.
     *
     * A teacher of English gets an English app, of French a French one, of
     * Japanese a Japanese one, and of any of the other twenty-four English —
     * because those are the three interfaces that exist, and guessing from the
     * browser instead is how somebody ends up reading a language they never
     * asked for.
     *
     * Written as an explicit 'en' rather than left null for the unsupported
     * languages. Null means "follow Accept-Language", which would give a
     * Spanish teacher on a French browser a French app: technically a guess
     * we are entitled to make, and exactly the surprise this is here to stop.
     *
     * Only during setup. Once onboarding is finished this never fires again,
     * so changing your teaching language in Settings later cannot silently
     * undo a language you chose there — that picker owns the column from then
     * on.
     */
    if (!setUp) update.ui_language = localeForTeachingLanguage(name) ?? DEFAULT_LOCALE
  }
  if (typeof patch.speakingLanguage === 'string') update.speaking_language = patch.speakingLanguage.trim().slice(0, 60) || null
  if (typeof patch.timezone === 'string' && patch.timezone.trim()) update.timezone = patch.timezone.trim().slice(0, 60)
  if (isTeachingPlatform(patch.teachingPlatform)) {
    update.teaching_platform = patch.teachingPlatform
    // What we create when a student books follows from where they teach: a
    // marketplace lesson has a link already, and it isn't ours to make.
    update.meeting_platform = linkPlatformFor(patch.teachingPlatform)
  }
  if (isCalendarMode(patch.calendarMode)) update.calendar_mode = patch.calendarMode
  if (typeof patch.step === 'number') update.onboarding_step = Math.max(0, Math.min(10, Math.round(patch.step)))

  if (patch.brand) {
    const { data: row } = await supabase.from('profiles').select('brand').eq('id', userId).single()
    update.brand = resolveBrand({ ...(row?.brand ?? {}), ...patch.brand })
  }

  if (Object.keys(update).length === 0) return { success: true }

  const { error } = await supabase.from('profiles').update(update).eq('id', userId)
  if (error) return { success: false, error: error.message }

  // Keep the KV settings doc (which the booking/meeting-link code reads) in
  // step with the profile, so onboarding actually changes behaviour.
  if (update.meeting_platform) {
    try { await setPlatform(update.meeting_platform as Platform) } catch { /* non-fatal */ }
  }

  // The whole layout, not just this route: the language may have just changed
  // under the flow, and the steps after this one have to be written in it.
  if (update.ui_language) revalidatePath('/', 'layout')
  revalidatePath('/onboarding')
  return { success: true }
}

/** Mark onboarding done — this is what un-gates the rest of the teacher app. */
export async function completeOnboarding(): Promise<Result> {
  const ctx = await currentTeacher()
  if (!ctx) return { success: false, error: 'Not signed in as a teacher' }

  const { error } = await ctx.supabase
    .from('profiles')
    .update({ onboarding_completed_at: new Date().toISOString(), onboarding_step: 99 })
    .eq('id', ctx.userId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/', 'layout')
  return { success: true }
}

/** Save student-portal branding from the toolkit. */
export async function saveBrand(brand: Partial<Brand>): Promise<Result> {
  const ctx = await currentTeacher()
  if (!ctx) return { success: false, error: 'Not signed in as a teacher' }
  const { supabase, userId } = ctx

  const { data: row } = await supabase.from('profiles').select('brand').eq('id', userId).single()
  const merged = resolveBrand({ ...(row?.brand ?? {}), ...brand })

  const { error } = await supabase.from('profiles').update({ brand: merged }).eq('id', userId)
  if (error) return { success: false, error: error.message }

  revalidatePath('/teacher/branding')
  revalidatePath('/student/dashboard')
  return { success: true }
}
