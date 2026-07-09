'use server'

import { createClient } from '@/lib/supabase/server'
import { saveBookingOverrides, type BookingOverrides } from '@/lib/booking'

type Result = { success: boolean; error?: string }

const clampInt = (n: any, min: number, max: number, fallback: number) => {
  const v = Math.round(Number(n))
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback
}
const isHHMM = (s: any) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)

// Keep only well-formed ranges (start < end).
function cleanRanges(raw: any): [string, string][] {
  if (!Array.isArray(raw)) return []
  const out: [string, string][] = []
  for (const r of raw) {
    if (Array.isArray(r) && isHHMM(r[0]) && isHHMM(r[1]) && r[0] < r[1]) out.push([r[0], r[1]])
  }
  return out.sort((a, b) => a[0].localeCompare(b[0]))
}

export async function saveAvailability(input: BookingOverrides): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return { success: false, error: 'Unauthorized' }

  const weeklyHours: Record<number, [string, string][]> = {}
  for (let d = 0; d < 7; d++) weeklyHours[d] = cleanRanges(input.weeklyHours?.[d])

  const dateOverrides: Record<string, [string, string][]> = {}
  for (const [date, ranges] of Object.entries(input.dateOverrides ?? {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) dateOverrides[date] = cleanRanges(ranges)
  }

  const clean: BookingOverrides = {
    title: (input.title ?? '').toString().slice(0, 80).trim() || 'Language lesson',
    durationMin: clampInt(input.durationMin, 5, 480, 50),
    incrementMin: clampInt(input.incrementMin, 5, 240, 30),
    minNoticeHours: clampInt(input.minNoticeHours, 0, 720, 24),
    bufferBeforeMin: clampInt(input.bufferBeforeMin, 0, 240, 15),
    bufferAfterMin: clampInt(input.bufferAfterMin, 0, 240, 15),
    maxPerDay: clampInt(input.maxPerDay, 1, 50, 5),
    daysAhead: clampInt(input.daysAhead, 1, 120, 30),
    weeklyHours,
    dateOverrides,
  }

  await saveBookingOverrides(clean)
  return { success: true }
}
