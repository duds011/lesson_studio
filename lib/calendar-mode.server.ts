import { createClient } from '@/lib/supabase/server'
import { resolveCalendarMode, type CalendarMode } from './calendar-mode'

/**
 * The signed-in teacher's answer to "do your lessons live on a calendar?".
 *
 * Split from lib/calendar-mode so the labels can be imported by client
 * components without dragging the server Supabase client into their bundle.
 */
export async function currentCalendarMode(): Promise<CalendarMode> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'google'
    const { data } = await supabase.from('profiles').select('calendar_mode').eq('id', user.id).single()
    return resolveCalendarMode((data as any)?.calendar_mode)
  } catch {
    // Never let this question break a page — assume the calendar world.
    return 'google'
  }
}

/** Record that this teacher does (or no longer does) keep a calendar. */
export async function setCalendarMode(mode: CalendarMode): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ calendar_mode: mode }).eq('id', user.id)
  } catch { /* non-fatal */ }
}
