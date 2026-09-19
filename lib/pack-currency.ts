/**
 * What a PACK costs, where the teacher is.
 *
 * Not to be confused with lib/currency.ts, which is the currency a teacher
 * charges their own students in — a different direction of money entirely.
 * This one is us billing them.
 *
 * Mirrors app/i18n/currency.ts on the marketing site, which is where a teacher
 * first sees a price. If those two drift, somebody is quoted one number and
 * charged another. Same three currencies, same amounts: fixed price lists
 * rounded against the rate on 2026-09-18 (1 USD = 0.8726 EUR = 157.89 JPY),
 * never a live conversion.
 *
 * Stripe holds these as currency_options on each Price, so what is charged is
 * this amount and not an approximation. scripts/stripe-packs.mjs writes them —
 * change a number here and that script has to run again.
 */
export type PackCurrency = 'USD' | 'EUR' | 'JPY'

export type PackCurrencyInfo = {
  code: PackCurrency
  symbol: string
  /** Yen has no minor unit, so its amounts are whole and its display has no cents. */
  decimals: 0 | 2
  /** Prices in the order PACKS declares them: 10, 40, 100. */
  packs: [number, number, number]
}

export const PACK_CURRENCIES: Record<PackCurrency, PackCurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', decimals: 2, packs: [14, 53, 124] },
  EUR: { code: 'EUR', symbol: '€', decimals: 2, packs: [13, 49, 115] },
  JPY: { code: 'JPY', symbol: '¥', decimals: 0, packs: [2200, 8300, 19500] },
}

export const DEFAULT_PACK_CURRENCY: PackCurrency = 'USD'

/**
 * Narrow whatever arrived over the wire to a currency we actually sell in.
 *
 * The browser picks this, so in principle a teacher could ask for the cheapest
 * of the three. At today's rounding that is yen, at $123.51 against $124.00 —
 * four tenths of a percent, which is cheaper to ignore than to police. Keep an
 * eye on it when the rate moves: the rounding is what holds the three lists
 * together, and a list that drifts low becomes worth gaming.
 */
export function asPackCurrency(v: unknown): PackCurrency {
  return typeof v === 'string' && v in PACK_CURRENCIES ? (v as PackCurrency) : DEFAULT_PACK_CURRENCY
}

/**
 * Which currency a time zone means. Dollars everywhere not named below, which
 * covers the Americas, China and Korea; Europe/Istanbul is how Turkey is
 * spelled, so it needs no special case.
 */
export function packCurrencyForTimeZone(tz: string | undefined | null): PackCurrency {
  if (!tz) return 'USD'
  if (tz === 'Asia/Tokyo') return 'JPY'
  if (tz.startsWith('Europe/')) return 'EUR'
  if (/^(Atlantic\/(Canary|Madeira|Azores|Reykjavik)|Africa\/Ceuta)$/.test(tz)) return 'EUR'
  return 'USD'
}

/** The browser's own zone. Returns USD anywhere Intl is unavailable. */
export function detectPackCurrency(): PackCurrency {
  try {
    return packCurrencyForTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  } catch {
    return 'USD'
  }
}

/** Smallest-unit amount for Stripe: cents for USD and EUR, whole yen for JPY. */
export function packMinorUnits(amount: number, code: PackCurrency): number {
  return PACK_CURRENCIES[code].decimals === 0 ? Math.round(amount) : Math.round(amount * 100)
}

export function formatPackMoney(n: number, code: PackCurrency = DEFAULT_PACK_CURRENCY): string {
  const c = PACK_CURRENCIES[code]
  const body =
    c.decimals === 0
      ? Math.round(n).toLocaleString('en-US')
      : Number.isInteger(n)
        ? String(n)
        : n.toFixed(2)
  return `${c.symbol}${body}`
}
