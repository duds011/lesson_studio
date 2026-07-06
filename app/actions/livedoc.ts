'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { success: boolean; error?: string }

async function requireTeacherStudent(studentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' as const }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return { error: 'Unauthorized' as const }
  const { data: student } = await supabase.from('students').select('id').eq('id', studentId).eq('teacher_id', user.id).single()
  if (!student) return { error: 'Student not found' as const }
  return { supabase, user }
}

// Ensure the doc row exists and set its live state.
export async function setLiveDoc(studentId: string, active: boolean): Promise<Result> {
  const auth = await requireTeacherStudent(studentId)
  if ('error' in auth) return { success: false, error: auth.error }

  const { error } = await auth.supabase
    .from('lesson_docs')
    .upsert({ teacher_id: auth.user.id, student_id: studentId, active }, { onConflict: 'student_id' })
  if (error) return { success: false, error: error.message }
  revalidatePath(`/teacher/students/${studentId}`)
  revalidatePath('/student/dashboard')
  return { success: true }
}
