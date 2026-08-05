'use server'

import { revalidatePath } from 'next/cache'
import { isCalendarMode } from '@/lib/calendar-mode'
import { setCalendarMode } from '@/lib/calendar-mode.server'

/**
 * Change the answer given in onboarding. A teacher who starts on a marketplace
 * and later moves their week onto Google shouldn't have to reinstall anything
 * to get the calendar surfaces back — and the reverse should be as easy.
 */
export async function chooseCalendarMode(formData: FormData) {
  const mode = formData.get('mode')
  if (!isCalendarMode(mode)) return
  await setCalendarMode(mode)
  revalidatePath('/', 'layout')
}
