'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/currency'

export interface BuyPkg { id: string; name: string; lessons_count: number; amount: number; currency: string }

export default function BuyLessons({ packages }: { packages: BuyPkg[] }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (!packages.length) return null

  async function buy(id: string) {
    setBusy(id); setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageId: id }) })
      const json = await res.json()
      if (json.ok && json.url) { window.location.href = json.url; return }
      setError(json.error || 'Could not start checkout.'); setBusy(null)
    } catch { setError('Could not start checkout.'); setBusy(null) }
  }

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'grid', gap: 12 }}>
      <div>
        <p className="analytics-label" style={{ marginBottom: 2 }}>🛒 Buy more lessons</p>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Pay securely by card. Your lessons are added automatically once payment clears.</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
        {packages.map(p => (
          <div key={p.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--surface)' }}>
            <strong style={{ fontSize: 14 }}>{p.name}</strong>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{p.lessons_count} lesson{p.lessons_count === 1 ? '' : 's'}</span>
            <span style={{ fontWeight: 800, color: 'var(--brand)', fontSize: 18 }}>{formatMoney(p.amount, p.currency)}</span>
            <button className="btn btn-primary btn-sm" disabled={busy === p.id} onClick={() => buy(p.id)} style={{ marginTop: 'auto' }}>
              {busy === p.id ? 'Redirecting…' : 'Buy'}
            </button>
          </div>
        ))}
      </div>
      {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{error}</p>}
    </div>
  )
}
