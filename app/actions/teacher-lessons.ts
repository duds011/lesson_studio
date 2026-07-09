'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireTeacher() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { error: 'Not authenticated' as const }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return { error: 'Unauthorized' as const }
  return { user }
}

// Delete a lesson (and its recap/summary via FK cascade). Teacher-scoped.
export async function deleteLesson(lessonId: string): Promise<{ success: boolean; error?: string; studentId?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const admin = createAdminClient()
  const { data: lesson } = await admin.from('lessons').select('id, teacher_id, student_id').eq('id', lessonId).single()
  if (!lesson || lesson.teacher_id !== auth.user.id) return { success: false, error: 'Lesson not found' }

  const { error } = await admin.from('lessons').delete().eq('id', lessonId)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/teacher/students/${lesson.student_id}`)
  revalidatePath('/teacher/dashboard')
  return { success: true, studentId: lesson.student_id }
}
