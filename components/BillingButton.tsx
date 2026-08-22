'use client'

import { useState } from 'react'

/**
 * A button that starts something on Stripe and hands the teacher over to it.
 *
 * Every billing action is a POST that answers with a URL to visit, so this is
 * the one component all of them share. It keeps the button disabled while the
 * request is in flight — a double click on "Subscribe" would otherwise open two
 * Checkout Sessions, and a teacher who paid twice is a refund and an apology.
 */
export default function BillingButton({
  planId,
  topup,
  portal,
  children,
  className = 'btn btn-primary btn-sm',
  style,
}: {
  planId?: string
  topup?: boolean
  portal?: boolean
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
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
        body: JSON.stringify(portal ? {} : { planId, topup: Boolean(topup) }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.url) {
        // The real thing goes to the console; the teacher gets a sentence.
        console.error('[billing]', res.status, json)
        setError(
          json?.error && typeof json.error === 'string'
            ? json.error
            : 'Could not reach Stripe just now. Try again in a moment.',
        )
        setBusy(false)
        return
      }
      window.location.href = json.url
    } catch (e) {
      console.error('[billing]', e)
      setError('Could not reach Stripe just now. Try again in a moment.')
      setBusy(false)
    }
  }

  return (
    <>
      <button type="button" className={className} style={style} onClick={go} disabled={busy}>
        {busy ? 'Opening Stripe…' : children}
      </button>
      {error && (
        <p className="desc" style={{ color: 'var(--red)', marginTop: 8 }}>
          {error}
        </p>
      )}
    </>
  )
}
