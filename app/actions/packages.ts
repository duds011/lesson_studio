'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface PackageInput {
  name: string
  lessons_count: number
  amount: number
  currency: string
  active: boolean
}

type Result = { success: boolean; error?: string }

async function requireTeacher() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { error: 'Not authenticated' as const }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return { error: 'Unauthorized' as const }
  return { user, supabase }
}

function validate(input: PackageInput): string | null {
  if (!input.name?.trim()) return 'Name is required'
  if (!(input.lessons_count > 0)) return 'Lessons must be greater than zero'
  if (!(input.amount >= 0)) return 'Enter a valid amount'
  return null
}

export async function createPackage(input: PackageInput): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }
  const bad = validate(input)
  if (bad) return { success: false, error: bad }

  const { error } = await auth.supabase.from('lesson_packages').insert({
    teacher_id: auth.user.id,
    name: input.name.trim(),
    lessons_count: input.lessons_count,
    amount: input.amount,
    currency: input.currency || 'USD',
    active: input.active,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/teacher/payments')
  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function updatePackage(id: string, input: PackageInput): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }
  const bad = validate(input)
  if (bad) return { success: false, error: bad }

  const { error } = await auth.supabase
    .from('lesson_packages')
    .update({
      name: input.name.trim(),
      lessons_count: input.lessons_count,
      amount: input.amount,
      currency: input.currency || 'USD',
      active: input.active,
    })
    .eq('id', id)
    .eq('teacher_id', auth.user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/teacher/payments')
  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function deletePackage(id: string): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }
  const { error } = await auth.supabase.from('lesson_packages').delete().eq('id', id).eq('teacher_id', auth.user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/teacher/payments')
  revalidatePath('/student/dashboard')
  return { success: true }
}
