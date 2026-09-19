'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Whether this teacher's recaps reach the student without being reviewed.
 *
 * Reviewing is the default and stays the default — a generated recap can be
 * wrong and the teacher's name is on it. But a teacher who never opens the
 * queue leaves their student with nothing at all, and nothing is worse than
 * imperfect: the lesson was recorded and paid for either way.
 *
 * Written through the teacher's own client, not the admin one. Updating one
 * column on your own profile row is exactly what RLS is for.
 */
export async function chooseAutoPublish(formData: FormData) {
  const on = formData.get('on') === 'yes'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').update({ auto_publish_recaps: on }).eq('id', user.id)
  revalidatePath('/', 'layout')
}
