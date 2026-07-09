/**
 * Teacher payment methods — how a student should pay their teacher.
 * Stored as an ordered JSONB list on profiles.payment_methods. Manual
 * reconciliation: the teacher still records received payments in the ledger.
 */
type Client = { from: (t: string) => any }

export type PaymentMethodType = 'bank' | 'paypal' | 'wise' | 'revolut' | 'stripe' | 'other'

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  label: string // e.g. "Bank transfer (EUR)"
  value: string // IBAN, paypal.me URL, payment link, etc.
  note?: string // optional instructions ("Include your name as reference")
}

/** Presentation metadata per type — icon + whether the value is a URL. */
export const METHOD_META: Record<PaymentMethodType, { icon: string; name: string; isLink: boolean; placeholder: string }> = {
  bank:    { icon: '🏦', name: 'Bank / IBAN',    isLink: false, placeholder: 'IBAN, account number, or bank details' },
  paypal:  { icon: '🅿️', name: 'PayPal.me',      isLink: true,  placeholder: 'https://paypal.me/yourname' },
  wise:    { icon: '💸', name: 'Wise',           isLink: true,  placeholder: 'https://wise.com/pay/me/yourname' },
  revolut: { icon: '🟣', name: 'Revolut',        isLink: true,  placeholder: 'https://revolut.me/yourname' },
  stripe:  { icon: '💳', name: 'Payment link',   isLink: true,  placeholder: 'https://buy.stripe.com/...' },
  other:   { icon: '✨', name: 'Other',          isLink: false, placeholder: 'Details students need to pay you' },
}

export const METHOD_TYPES = Object.keys(METHOD_META) as PaymentMethodType[]

/** Normalize/validate a stored list into well-formed PaymentMethod objects. */
export function normalizeMethods(raw: unknown): PaymentMethod[] {
  if (!Array.isArray(raw)) return []
  const out: PaymentMethod[] = []
  for (const m of raw) {
    if (!m || typeof m !== 'object') continue
    const type = (m as any).type
    const value = (m as any).value
    if (!METHOD_META[type as PaymentMethodType] || typeof value !== 'string' || !value.trim()) continue
    out.push({
      id: typeof (m as any).id === 'string' && (m as any).id ? (m as any).id : Math.random().toString(36).slice(2, 10),
      type,
      label: typeof (m as any).label === 'string' ? (m as any).label.trim() : '',
      value: value.trim(),
      note: typeof (m as any).note === 'string' && (m as any).note.trim() ? (m as any).note.trim() : undefined,
    })
  }
  return out
}

/**
 * Read a teacher's payment methods for the student portal.
 * Students can't read the teacher's profile row under RLS, so pass the ADMIN
 * client (service role) — only the payment-method list is surfaced, nothing else.
 */
export async function getTeacherPaymentMethods(admin: Client, teacherId: string): Promise<PaymentMethod[]> {
  const { data } = await admin.from('profiles').select('payment_methods').eq('id', teacherId).single()
  return normalizeMethods(data?.payment_methods)
}
