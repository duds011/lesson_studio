'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatMoney } from '@/lib/currency'

export interface BuyPkg { id: string; name: string; lessons_count: number; amount: number; currency: string }
export interface Credits { purchased: number; used: number; remaining: number; low: boolean }

export default function StudentLessonsBar({ credits, packages }: { credits: Credits; packages: BuyPkg[] }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const hasPkg = credits.purchased > 0 || credits.used > 0
  const out = hasPkg && credits.remaining <= 0
  const low = credits.low && !out
  const color = out ? 'var(--red)' : low ? 'var(--amber)' : 'var(--brand)'
  const note = out ? 'Out of prepaid lessons — top up to keep booking.'
    : low ? 'Last lesson — consider topping up.'
    : 'Book your next lesson any time.'

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
    <>
      <div
        className="analytics-card"
        style={{
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '12px 16px',
          borderColor: out ? '#f0cece' : low ? '#ead7a5' : 'var(--line)',
          background: out ? 'var(--red-soft)' : low ? 'var(--amber-soft)' : 'var(--surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontSize: 26, fontWeight: 850, lineHeight: 1, color }}>{hasPkg ? credits.remaining : '—'}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>
            lesson{credits.remaining === 1 ? '' : 's'} left{credits.purchased > 0 ? ` / ${credits.purchased} bought` : ''}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{note}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {packages.length > 0 && (
            <button className={`btn btn-sm ${out || low ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setError(''); setOpen(true) }}>
              Buy more lessons
            </button>
          )}
          <Link href="/student/book" className="btn btn-primary btn-sm">Book a lesson →</Link>
        </div>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(21,23,20,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setOpen(false)}>
          <div className="surface" style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ margin: 0 }}>🛒 Buy more lessons</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
            </div>
            <p className="sub" style={{ marginTop: 0, marginBottom: 16 }}>Pay securely by card. Your lessons are added automatically once payment clears.</p>
            <div style={{ display: 'grid', gap: 10 }}>
              {packages.map((p) => (
                <div key={p.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 14 }}>{p.name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.lessons_count} lesson{p.lessons_count === 1 ? '' : 's'}</div>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--brand)', fontSize: 16 }}>{formatMoney(p.amount, p.currency)}</span>
                  <button className="btn btn-primary btn-sm" disabled={busy === p.id} onClick={() => buy(p.id)}>
                    {busy === p.id ? 'Redirecting…' : 'Buy'}
                  </button>
                </div>
              ))}
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 12, marginBottom: 0 }}>{error}</p>}
          </div>
        </div>
      )}
    </>
  )
}
