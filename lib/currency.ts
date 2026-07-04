export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'] as const

const SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$',
}

export function currencySymbol(code?: string | null): string {
  return SYMBOLS[code ?? 'USD'] ?? (code ?? '$')
}

export function formatMoney(amount: number, code?: string | null): string {
  const c = code ?? 'USD'
  // JPY has no minor units.
  const fractionDigits = c === 'JPY' ? 0 : 2
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: c, minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(amount)
  } catch {
    return `${currencySymbol(c)}${amount.toFixed(fractionDigits)}`
  }
}
