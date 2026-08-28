'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Whether this teacher collects the recap's speaking exercises as recordings.
 *
 * Off, the three speaking exercises are dropped from the student's practice
 * tab entirely rather than shown as homework with nowhere to hand it in.
 */
export async function chooseSpeakingSubmissions(formData: FormData) {
  const on = formData.get('on') === 'yes'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').update({ speaking_submissions: on }).eq('id', user.id)
  revalidatePath('/', 'layout')
}
