'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { normalizeMethods, type PaymentMethod } from '@/lib/payment-methods'

export interface PaymentInput {
  amount: number
  currency?: string
  status: 'paid' | 'pending'
  description?: string
  lessons_covered?: number | null
  payment_date?: string | null
  due_date?: string | null
  method?: string
}

const TRIAL_ID = '__trial__'
const OTHER_ID = '__other__'

async function requireTeacher() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { error: 'Not authenticated' as const }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return { error: 'Unauthorized' as const }
  return { user, supabase }
}

type Result = { success: boolean; error?: string }

export async function addPayment(studentId: string, input: PaymentInput): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const category = studentId === TRIAL_ID ? 'trial' : studentId === OTHER_ID ? 'other' : 'student'
  const realStudentId = category === 'student' ? studentId : null

  const { error } = await auth.supabase.from('payments').insert({
    teacher_id: auth.user.id,
    student_id: realStudentId,
    category,
    amount: input.amount,
    currency: input.currency ?? 'USD',
    status: input.status,
    description: input.description || null,
    lessons_covered: input.lessons_covered ?? null,
    payment_date: input.status === 'paid' ? (input.payment_date || null) : null,
    due_date: input.status === 'pending' ? (input.due_date || null) : null,
    method: input.method || null,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/teacher/payments')
  revalidatePath('/teacher/dashboard')
  return { success: true }
}

export async function updatePayment(id: string, input: PaymentInput): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const { error } = await auth.supabase
    .from('payments')
    .update({
      amount: input.amount,
      currency: input.currency,
      status: input.status,
      description: input.description || null,
      lessons_covered: input.lessons_covered ?? null,
      payment_date: input.status === 'paid' ? (input.payment_date || null) : null,
      due_date: input.status === 'pending' ? (input.due_date || null) : null,
      method: input.method || null,
    })
    .eq('id', id)
    .eq('teacher_id', auth.user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/teacher/payments')
  revalidatePath('/teacher/dashboard')
  return { success: true }
}

export async function markPaymentPaid(id: string): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }
  const today = new Date().toISOString().slice(0, 10)
  const { error } = await auth.supabase.from('payments').update({ status: 'paid', payment_date: today }).eq('id', id).eq('teacher_id', auth.user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/teacher/payments')
  revalidatePath('/teacher/dashboard')
  return { success: true }
}

export async function deletePayment(id: string): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }
  const { error } = await auth.supabase.from('payments').delete().eq('id', id).eq('teacher_id', auth.user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/teacher/payments')
  revalidatePath('/teacher/dashboard')
  return { success: true }
}

export async function updateTeacherCurrency(currency: string): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }
  const { error } = await auth.supabase.from('profiles').update({ currency }).eq('id', auth.user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/teacher/payments')
  return { success: true }
}

export async function updatePaymentMethods(methods: PaymentMethod[]): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }
  // Re-validate server-side; the teacher writes only their own profile (RLS).
  const clean = normalizeMethods(methods)
  const { error } = await auth.supabase.from('profiles').update({ payment_methods: clean }).eq('id', auth.user.id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/teacher/payments')
  revalidatePath('/student/dashboard')
  return { success: true }
}
