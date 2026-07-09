'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePaymentMethods } from '@/app/actions/payments'
import { METHOD_META, METHOD_TYPES, type PaymentMethod, type PaymentMethodType } from '@/lib/payment-methods'

const uid = () => Math.random().toString(36).slice(2, 10)
const blank = (): PaymentMethod => ({ id: uid(), type: 'bank', label: '', value: '', note: '' })

export default function PaymentMethodsManager({ initial }: { initial: PaymentMethod[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [methods, setMethods] = useState<PaymentMethod[]>(initial)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function patch(id: string, upd: Partial<PaymentMethod>) {
    setSaved(false)
    setMethods((ms) => ms.map((m) => (m.id === id ? { ...m, ...upd } : m)))
  }
  function add() { setSaved(false); setMethods((ms) => [...ms, blank()]) }
  function remove(id: string) { setSaved(false); setMethods((ms) => ms.filter((m) => m.id !== id)) }

  function save() {
    setError('')
    const cleaned = methods
      .map((m) => ({ ...m, label: m.label.trim(), value: m.value.trim(), note: m.note?.trim() || undefined }))
      .filter((m) => m.value)
    startTransition(async () => {
      const res = await updatePaymentMethods(cleaned)
      if (res.success) { setMethods(cleaned); setSaved(true); router.refresh() }
      else setError(res.error || 'Could not save')
    })
  }

  const inputStyle: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 9, padding: '9px 11px', background: '#fff', width: '100%', font: 'inherit' }

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'grid', gap: 14 }}>
      <div>
        <p className="analytics-label" style={{ marginBottom: 2 }}>💳 How students pay you</p>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          These show on your students&rsquo; dashboards and booking confirmations. You still record received payments above.
        </span>
      </div>

      {methods.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No payment methods yet — add one so students know how to pay you.</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {methods.map((m) => {
          const meta = METHOD_META[m.type]
          return (
            <div key={m.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 12, display: 'grid', gap: 10, background: 'var(--surface)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: 10, alignItems: 'start' }}>
                <div className="field" style={{ margin: 0 }}>
                  <label>Type</label>
                  <select value={m.type} onChange={(e) => patch(m.id, { type: e.target.value as PaymentMethodType })} style={inputStyle}>
                    {METHOD_TYPES.map((t) => <option key={t} value={t}>{METHOD_META[t].icon} {METHOD_META[t].name}</option>)}
                  </select>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Label (optional)</label>
                  <input value={m.label} onChange={(e) => patch(m.id, { label: e.target.value })} placeholder={`e.g. ${meta.name} (EUR)`} style={inputStyle} />
                </div>
                <button className="btn btn-danger-ghost btn-sm" onClick={() => remove(m.id)} style={{ marginTop: 22 }} aria-label="Remove method">✕</button>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>{meta.isLink ? 'Link / URL' : 'Details'}</label>
                <input value={m.value} onChange={(e) => patch(m.id, { value: e.target.value })} placeholder={meta.placeholder} style={inputStyle} />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Note for students (optional)</label>
                <input value={m.note ?? ''} onChange={(e) => patch(m.id, { note: e.target.value })} placeholder="e.g. Add your name as the payment reference" style={inputStyle} />
              </div>
            </div>
          )
        })}
      </div>

      {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={add} disabled={pending}>+ Add method</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {saved && <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ Saved</span>}
          <button className="btn btn-primary btn-sm" onClick={save} disabled={pending}>{pending ? 'Saving…' : 'Save payment methods'}</button>
        </div>
      </div>
    </div>
  )
}
