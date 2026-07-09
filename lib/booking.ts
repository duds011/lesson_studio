/**
 * Native booking engine — replaces Calendly.
 * All availability is in Japan time (Asia/Tokyo, fixed +09:00, no DST).
 *
 * DEFAULT_BOOKING holds the fallback config; the teacher edits an overrides
 * doc (see getBookingConfig / saveBookingOverrides) from Settings → Availability.
 */
import { readDoc, writeDoc } from './docstore'

export type Range = [string, string] // ['HH:MM','HH:MM']

export interface BookingConfig {
  tz: string
  offset: string
  title: string
  durationMin: number
  incrementMin: number
  minNoticeHours: number
  bufferBeforeMin: number
  bufferAfterMin: number
  maxPerDay: number
  daysAhead: number
  addMeet: boolean
  weeklyHours: Record<number, Range[]> // 0=Sun … 6=Sat; [] = unavailable
  dateOverrides: Record<string, Range[]> // Tokyo YYYY-MM-DD → ranges ([] = day off)
}

export const DEFAULT_BOOKING: BookingConfig = {
  tz: 'Asia/Tokyo',
  offset: '+09:00',
  title: 'Language lesson',
  durationMin: 50,
  incrementMin: 30,
  minNoticeHours: 24,
  bufferBeforeMin: 15,
  bufferAfterMin: 15,
  maxPerDay: 5,
  daysAhead: 30,
  addMeet: true,
  weeklyHours: {
    0: [],
    1: [],
    2: [['09:00', '23:00']],
    3: [['09:00', '23:00']],
    4: [['09:00', '23:00']],
    5: [['09:00', '20:00']],
    6: [['09:00', '17:00']],
  },
  dateOverrides: {},
}

// Back-compat alias — the fixed constants (tz/offset) used by the helpers below.
export const BOOKING = DEFAULT_BOOKING

// The teacher may edit everything except the timezone (fixed +09:00 Tokyo).
export type BookingOverrides = Partial<Omit<BookingConfig, 'tz' | 'offset'>>

/** Current effective booking config: stored overrides merged over defaults. */
export async function getBookingConfig(): Promise<BookingConfig> {
  const stored = await readDoc<BookingOverrides>('availability')
  return {
    ...DEFAULT_BOOKING,
    ...(stored ?? {}),
    tz: DEFAULT_BOOKING.tz,
    offset: DEFAULT_BOOKING.offset,
  }
}

export async function saveBookingOverrides(o: BookingOverrides): Promise<void> {
  await writeDoc('availability', o)
}

const MIN = 60_000

export type Busy = { start: number; end: number } // epoch ms

// ── Tokyo date helpers (Japan has no DST, so a fixed +09:00 offset is safe) ──
export function todayTokyo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: DEFAULT_BOOKING.tz })
}
export function addDaysTokyo(dateStr: string, n: number): string {
  const base = new Date(`${dateStr}T00:00:00${DEFAULT_BOOKING.offset}`).getTime()
  return new Date(base + n * 86_400_000).toLocaleDateString('en-CA', { timeZone: DEFAULT_BOOKING.tz })
}
function weekdayIndex(dateStr: string): number {
  // noon Tokyo = 03:00Z same calendar day → getUTCDay gives the right weekday
  return new Date(`${dateStr}T12:00:00${DEFAULT_BOOKING.offset}`).getUTCDay()
}
function toMs(dateStr: string, hhmm: string): number {
  return new Date(`${dateStr}T${hhmm}:00${DEFAULT_BOOKING.offset}`).getTime()
}

export function intervalsForDate(cfg: BookingConfig, dateStr: string): Range[] {
  if (dateStr in cfg.dateOverrides) return cfg.dateOverrides[dateStr]
  return cfg.weeklyHours[weekdayIndex(dateStr)] ?? []
}

/** Available slot start times (epoch ms) for one Tokyo date. */
export function slotsForDate(
  cfg: BookingConfig,
  dateStr: string,
  nowMs: number,
  busy: Busy[],
  countThatDay: number
): number[] {
  if (countThatDay >= cfg.maxPerDay) return []

  const durationMs = cfg.durationMin * MIN
  const stepMs = cfg.incrementMin * MIN
  const noticeMs = cfg.minNoticeHours * 60 * MIN
  const bufBefore = cfg.bufferBeforeMin * MIN
  const bufAfter = cfg.bufferAfterMin * MIN

  const out: number[] = []
  for (const [s, e] of intervalsForDate(cfg, dateStr)) {
    const winEnd = toMs(dateStr, e)
    for (let cur = toMs(dateStr, s); cur + durationMs <= winEnd; cur += stepMs) {
      const start = cur
      const end = cur + durationMs
      if (start < nowMs + noticeMs) continue // min notice
      const blockStart = start - bufBefore
      const blockEnd = end + bufAfter
      const conflict = busy.some((b) => blockStart < b.end && blockEnd > b.start)
      if (!conflict) out.push(start)
    }
  }
  return out
}

export type DayAvailability = { date: string; weekday: string; slots: number[] }

/** Build availability for the whole booking window. */
export function buildAvailability(cfg: BookingConfig, nowMs: number, busy: Busy[]): DayAvailability[] {
  // count existing events per Tokyo day (for maxPerDay)
  const countByDay: Record<string, number> = {}
  for (const b of busy) {
    const d = new Date(b.start).toLocaleDateString('en-CA', { timeZone: cfg.tz })
    countByDay[d] = (countByDay[d] ?? 0) + 1
  }

  const days: DayAvailability[] = []
  const start = todayTokyo()
  for (let i = 0; i <= cfg.daysAhead; i++) {
    const date = addDaysTokyo(start, i)
    const slots = slotsForDate(cfg, date, nowMs, busy, countByDay[date] ?? 0)
    if (slots.length === 0) continue
    days.push({
      date,
      weekday: new Date(`${date}T12:00:00${cfg.offset}`).toLocaleDateString('en-US', {
        weekday: 'short', timeZone: cfg.tz,
      }),
      slots,
    })
  }
  return days
}
