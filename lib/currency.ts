export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'] as const

const SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$',
}

export function currencySymbol(code?: string | null): string {
  return SYMBOLS[code ?? 'USD'] ?? (code ?? '$')
}

/**
 * Money in whole units, symbol in front: `$0`, `€1,200`, `¥5,000`.
 *
 * Two things were wrong with letting Intl format this in `currency` style. It
 * was passed `undefined` as the locale, so the output followed whatever locale
 * the machine rendering it happened to have — on a Portuguese one `$0` came out
 * as `0,00 US$`, and the same figure looked different depending on who opened
 * the page. And the cents were noise: lesson packages and bank transfers are
 * priced in round numbers, so every amount carried a `,00` that said nothing.
 *
 * Grouping is pinned to en-US for the same reason the symbol is pinned in
 * front — one format everywhere beats one that drifts per viewer.
 */
export function formatMoney(amount: number, code?: string | null): string {
  const rounded = Math.round(amount)
  const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.abs(rounded))
  // Sign outside the symbol, so a refund reads "-$50" rather than "$-50".
  return `${rounded < 0 ? '-' : ''}${currencySymbol(code)}${grouped}`
}
