'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { setPlatform, type Platform } from '@/lib/settings'
import { linkPlatformFor, isTeachingPlatform, type TeachingPlatform } from '@/lib/teaching-platform'
import { resolveBrand, type Brand } from '@/lib/brand'

type Result = { success: boolean; error?: string }

/** The teacher currently signed in, or null. */
async function currentTeacher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return null
  return { supabase, userId: user.id }
}

export type OnboardingPatch = {
  teachingLanguage?: string
  timezone?: string
  teachingPlatform?: TeachingPlatform
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
  const { supabase, userId } = ctx

  const update: Record<string, unknown> = {}
  if (typeof patch.teachingLanguage === 'string') update.teaching_language = patch.teachingLanguage.trim().slice(0, 60) || null
  if (typeof patch.timezone === 'string' && patch.timezone.trim()) update.timezone = patch.timezone.trim().slice(0, 60)
  if (isTeachingPlatform(patch.teachingPlatform)) {
    update.teaching_platform = patch.teachingPlatform
    // What we create when a student books follows from where they teach: a
    // marketplace lesson has a link already, and it isn't ours to make.
    update.meeting_platform = linkPlatformFor(patch.teachingPlatform)
  }
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
