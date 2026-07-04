'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStudent } from '@/app/actions/portal-students'
import { addPayment } from '@/app/actions/payments'
import { currencySymbol } from '@/lib/currency'

const LEVELS = ['Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced']

function randomPassword() {
  return Math.random().toString(36).slice(-8) + 'A1!'
}

const emptyForm = () => ({
  full_name: '', email: '', password: randomPassword(), language: 'Japanese', level: 'Beginner',
  // Optional starting package
  lessons: '', amount: '', method: '',
})

export default function AddStudentForm({ currency = 'USD' }: { currency?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ email: string; password: string; note?: string } | null>(null)
  const [form, setForm] = useState(emptyForm())

  const set = (k: keyof ReturnType<typeof emptyForm>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')

    const res = await createStudent({
      full_name: form.full_name, email: form.email, password: form.password,
      language: form.language, level: form.level,
    })
    if (!res.success || !res.studentId) {
      setBusy(false)
      setError(res.error || 'Could not create student')
      return
    }

    // Optionally record the starting package as their first payment/credit.
    const lessons = form.lessons ? parseInt(form.lessons, 10) : 0
    const amount = form.amount ? parseFloat(form.amount) : 0
    let note = ''
    if (lessons > 0 || amount > 0) {
      const pay = await addPayment(res.studentId, {
        amount, currency, status: 'paid',
        description: lessons > 0 ? `${lessons}-lesson starting package` : 'Starting payment',
        lessons_covered: lessons > 0 ? lessons : null,
        payment_date: new Date().toISOString().slice(0, 10),
        method: form.method,
      })
      note = pay.success
        ? (lessons > 0 ? `${lessons} lessons added to their balance.` : 'Payment recorded.')
        : `Student created, but the payment failed: ${pay.error}`
    }

    setBusy(false)
    setCreated({ email: form.email, password: form.password, note })
    setForm(emptyForm())
    router.refresh()
  }

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => { setOpen(true); setCreated(null) }}>
        + Add student
      </button>
    )
  }

  const inputStyle: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 9, padding: '11px 12px', background: '#fff' }

  return (
    <div className="settings-card" style={{ padding: 22, maxWidth: 460 }}>
      <div className="settings-row" style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0 }}>New student</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Close</button>
      </div>

      {created ? (
        <div>
          <div className="warn-box" style={{ borderColor: '#9dd0b4', background: 'var(--green-soft)', color: 'var(--green)' }}>
            <strong>Account created.</strong> Share these login details with the student:
          </div>
          <div className="lesson-block" style={{ marginTop: 12, padding: 16 }}>
            <div className="talk-row"><span>Email</span><strong>{created.email}</strong></div>
            <div className="talk-row" style={{ borderBottom: 0 }}><span>Password</span><strong>{created.password}</strong></div>
          </div>
          {created.note && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{created.note}</p>}
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setCreated(null)}>Add another</button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <div className="field">
            <label>Full name</label>
            <input value={form.full_name} onChange={set('full_name')} required placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} required placeholder="jane@example.com" autoComplete="off" />
          </div>
          <div className="field">
            <label>Temporary password</label>
            <input value={form.password} onChange={set('password')} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Level</label>
              <select value={form.level} onChange={set('level')} style={inputStyle}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Language</label>
              <input value={form.language} onChange={set('language')} required />
            </div>
          </div>

          {/* Optional starting package */}
          <div style={{ borderTop: '1px solid var(--line)', margin: '8px 0 4px', paddingTop: 12 }}>
            <div className="analytics-label" style={{ marginBottom: 8 }}>Starting package (optional)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Lessons purchased</label>
                <input type="number" min="0" step="1" value={form.lessons} onChange={set('lessons')} placeholder="e.g. 4" style={inputStyle} />
              </div>
              <div className="field">
                <label>Amount paid ({currencySymbol(currency)})</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" style={inputStyle} />
              </div>
            </div>
            <div className="field">
              <label>Payment method</label>
              <input value={form.method} onChange={set('method')} placeholder="Bank transfer, Cash, PayPal…" style={inputStyle} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>Leave blank if they haven&rsquo;t paid yet — you can record it later in Payments.</p>
          </div>

          {error && <div className="warn-box" style={{ marginTop: 8, borderColor: '#f0cece', background: 'var(--red-soft)', color: 'var(--red)' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={busy} style={{ marginTop: 14 }}>
            {busy ? 'Creating…' : 'Create student'}
          </button>
        </form>
      )}
    </div>
  )
}
