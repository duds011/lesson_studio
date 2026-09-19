'use client'

import { useState } from 'react'
import { detectPackCurrency } from '@/lib/pack-currency'
import { useT } from '@/components/I18nProvider'

/**
 * A button that starts something on Stripe and hands the teacher over to it.
 *
 * Every billing action is a POST that answers with a URL to visit, so this is
 * the one component all of them share. It keeps the button disabled while the
 * request is in flight — a double click on "Buy" would otherwise open two
 * Checkout Sessions, and a teacher who paid twice is a refund and an apology.
 */
export default function BillingButton({
  packId,
  portal,
  children,
  className = 'btn btn-primary btn-sm',
  style,
}: {
  packId?: string
  portal?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const t = useT()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function go() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(portal ? '/api/billing/portal' : '/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // The currency goes with the click, from the same time-zone rule that
        // decided which price the teacher was just looking at.
        body: JSON.stringify(portal ? {} : { packId, currency: detectPackCurrency() }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.url) {
        // The real thing goes to the console; the teacher gets a sentence.
        console.error('[billing]', res.status, json)
        setError(
          json?.error && typeof json.error === 'string'
            ? json.error
            : t.billing.stripeUnreachable,
        )
        setBusy(false)
        return
      }
      window.location.href = json.url
    } catch (e) {
      console.error('[billing]', e)
      setError(t.billing.stripeUnreachable)
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className={className} style={style} onClick={go} disabled={busy}>
        {busy ? t.billing.openingStripe : children}
      </button>
      {error && (
        <p className="desc" style={{ color: 'var(--red)', marginTop: 8 }}>
          {error}
        </p>
      )}
    </>
  )
}
