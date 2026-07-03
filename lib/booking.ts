/**
 * Native booking engine — replaces Calendly.
 * All availability is in Japan time (Asia/Tokyo, fixed +09:00, no DST).
 *
 * Edit this configuration to match the teacher's availability.
 */
export const BOOKING = {
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

  // Weekly hours by weekday (0=Sun … 6=Sat). [] = unavailable that day.
  // ⚠️ BEST-GUESS from the Calendly screenshot — please confirm/correct.
  weeklyHours: {
    0: [] as [string, string][],                 // Sun — unavailable
    1: [] as [string, string][],                 // Mon — unavailable
    2: [['09:00', '23:00']] as [string, string][], // Tue
    3: [['09:00', '23:00']] as [string, string][], // Wed
    4: [['09:00', '23:00']] as [string, string][], // Thu
    5: [['09:00', '20:00']] as [string, string][], // Fri
    6: [['09:00', '17:00']] as [string, string][], // Sat
  } as Record<number, [string, string][]>,

  // Date-specific overrides (Tokyo YYYY-MM-DD). Present here = replaces weekly hours.
  // [] = fully unavailable that day.
  dateOverrides: {
    '2026-07-01': [['16:00', '18:00']],
    '2026-07-02': [['13:00', '16:30'], ['20:00', '22:00']],
    '2026-07-03': [],
    '2026-07-05': [],
    '2026-07-06': [],
    '2026-07-12': [],
    '2026-07-13': [],
  } as Record<string, [string, string][]>,
}

const MIN = 60_000

export type Busy = { start: number; end: number } // epoch ms

// ── Tokyo date helpers (Japan has no DST, so a fixed +09:00 offset is safe) ──
export function todayTokyo(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: BOOKING.tz })
}
export function addDaysTokyo(dateStr: string, n: number): string {
  const base = new Date(`${dateStr}T00:00:00${BOOKING.offset}`).getTime()
  return new Date(base + n * 86_400_000).toLocaleDateString('en-CA', { timeZone: BOOKING.tz })
}
function weekdayIndex(dateStr: string): number {
  // noon Tokyo = 03:00Z same calendar day → getUTCDay gives the right weekday
  return new Date(`${dateStr}T12:00:00${BOOKING.offset}`).getUTCDay()
}
function toMs(dateStr: string, hhmm: string): number {
  return new Date(`${dateStr}T${hhmm}:00${BOOKING.offset}`).getTime()
}

export function intervalsForDate(dateStr: string): [string, string][] {
  if (dateStr in BOOKING.dateOverrides) return BOOKING.dateOverrides[dateStr]
  return BOOKING.weeklyHours[weekdayIndex(dateStr)] ?? []
}

/** Available slot start times (epoch ms) for one Tokyo date. */
export function slotsForDate(
  dateStr: string,
  nowMs: number,
  busy: Busy[],
  countThatDay: number
): number[] {
  if (countThatDay >= BOOKING.maxPerDay) return []

  const durationMs = BOOKING.durationMin * MIN
  const stepMs = BOOKING.incrementMin * MIN
  const noticeMs = BOOKING.minNoticeHours * 60 * MIN
  const bufBefore = BOOKING.bufferBeforeMin * MIN
  const bufAfter = BOOKING.bufferAfterMin * MIN

  const out: number[] = []
  for (const [s, e] of intervalsForDate(dateStr)) {
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
export function buildAvailability(nowMs: number, busy: Busy[]): DayAvailability[] {
  // count existing events per Tokyo day (for maxPerDay)
  const countByDay: Record<string, number> = {}
  for (const b of busy) {
    const d = new Date(b.start).toLocaleDateString('en-CA', { timeZone: BOOKING.tz })
    countByDay[d] = (countByDay[d] ?? 0) + 1
  }

  const days: DayAvailability[] = []
  const start = todayTokyo()
  for (let i = 0; i <= BOOKING.daysAhead; i++) {
    const date = addDaysTokyo(start, i)
    const slots = slotsForDate(date, nowMs, busy, countByDay[date] ?? 0)
    if (slots.length === 0) continue
    days.push({
      date,
      weekday: new Date(`${date}T12:00:00${BOOKING.offset}`).toLocaleDateString('en-US', {
        weekday: 'short', timeZone: BOOKING.tz,
      }),
      slots,
    })
  }
  return days
}
