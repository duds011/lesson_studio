'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { addPayment, updatePayment, deletePayment, markPaymentPaid, updateTeacherCurrency, PaymentInput } from '@/app/actions/payments'
import { formatMoney, currencySymbol, CURRENCIES } from '@/lib/currency'
import PageHeader from '@/components/PageHeader'
import DragScroller from '@/components/portal/DragScroller'

export interface StudentOption { id: string; fullName: string }
export interface Credit { purchased: number; used: number; remaining: number; low: boolean }
export interface ManagedPayment {
  id: string; studentId: string; studentName: string; amount: number; currency: string | null
  status: 'paid' | 'pending'; description: string | null; lessons_covered: number | null
  payment_date: string | null; due_date: string | null; method: string | null; created_at: string
}

const TRIAL_ID = '__trial__'
const OTHER_ID = '__other__'
const todayIso = () => new Date().toISOString().slice(0, 10)
const emptyForm = () => ({ amount: '', status: 'paid' as 'paid' | 'pending', description: '', lessons_covered: '', payment_date: todayIso(), due_date: '', method: '' })

export default function PaymentsManager({
  students, credits, payments, currency,
}: { students: StudentOption[]; credits: Record<string, Credit>; payments: ManagedPayment[]; currency: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<ManagedPayment | null>(null)
  const [studentId, setStudentId] = useState('')
  const [form, setForm] = useState(emptyForm())

  const sortedStudents = useMemo(() => [...students].sort((a, b) => a.fullName.localeCompare(b.fullName)), [students])
  const monthPrefix = todayIso().slice(0, 7)

  const totalReceived = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalOutstanding = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const thisMonth = payments.filter(p => p.status === 'paid' && p.payment_date?.startsWith(monthPrefix)).reduce((s, p) => s + p.amount, 0)
  // 12-month revenue buckets ending this month.
  const buckets = useMemo(() => {
    const now = new Date()
    const out: { month: string; key: string; revenue: number }[] = []
    const idx = new Map<string, number>()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      idx.set(key, out.length)
      out.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), key, revenue: 0 })
    }
    for (const p of payments) {
      if (p.status !== 'paid' || !p.payment_date) continue
      const i = idx.get(p.payment_date.slice(0, 7))
      if (i !== undefined) out[i].revenue += p.amount
    }
    return out
  }, [payments])
  const hasRevenue = buckets.some(b => b.revenue > 0)

  const recent = useMemo(() => [...payments].sort((a, b) =>
    (b.payment_date || b.due_date || b.created_at).localeCompare(a.payment_date || a.due_date || a.created_at)).slice(0, 40), [payments])

  /**
   * One month at a time, its days across — the exact shape of the notes grid,
   * with ← → to move between months. The 12-months-at-once table this replaces
   * showed a year of near-empty columns and no way to see WHEN in a month a
   * payment landed.
   */
  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-based
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dow = new Date(viewYear, viewMonth, day).getDay()
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return { day, iso, weekday: 'SMTWTFS'[dow], weekend: dow === 0 || dow === 6 }
  })
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const viewPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const today = todayIso()

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  /** studentId|YYYY-MM-DD → the payments on that day. */
  const byDay = useMemo(() => {
    const m = new Map<string, ManagedPayment[]>()
    for (const p of payments) {
      const k = `${p.studentId}|${(p.payment_date || p.due_date || p.created_at).slice(0, 10)}`
      const arr = m.get(k) ?? []
      arr.push(p)
      m.set(k, arr)
    }
    return m
  }, [payments])

  /** What each student paid inside the viewed month — the grid's Total column. */
  const monthPaidByStudent = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of payments) {
      if (p.status !== 'paid') continue
      if (!(p.payment_date || p.created_at).startsWith(viewPrefix)) continue
      m.set(p.studentId, (m.get(p.studentId) ?? 0) + p.amount)
    }
    return m
  }, [payments, viewPrefix])

  function openAdd(preset?: string, date?: string) {
    const f = emptyForm()
    // Clicking a cell means "a payment on that day", so the form opens dated there.
    if (date) f.payment_date = date
    setForm(f); setStudentId(preset ?? ''); setEditing(null); setError(''); setMode('add')
  }
  function openEdit(p: ManagedPayment) {
    setForm({ amount: String(p.amount), status: p.status, description: p.description ?? '', lessons_covered: p.lessons_covered != null ? String(p.lessons_covered) : '', payment_date: p.payment_date ?? todayIso(), due_date: p.due_date ?? '', method: p.method ?? '' })
    setStudentId(p.studentId); setEditing(p); setError(''); setMode('edit')
  }
  function close() { setMode(null); setEditing(null) }

  function submit() {
    if (mode === 'add' && !studentId) { setError('Select a student'); return }
    const amount = parseFloat(form.amount)
    if (!(amount > 0)) { setError('Enter an amount greater than zero'); return }
    const input: PaymentInput = {
      amount, currency, status: form.status, description: form.description,
      lessons_covered: form.lessons_covered ? parseInt(form.lessons_covered, 10) : null,
      payment_date: form.payment_date || null, due_date: form.due_date || null, method: form.method,
    }
    startTransition(async () => {
      const res = editing ? await updatePayment(editing.id, input) : await addPayment(studentId, input)
      if (res.success) { close(); router.refresh() } else setError(res.error || 'Failed to save')
    })
  }
  const act = (fn: () => Promise<any>) => startTransition(async () => { await fn(); close(); router.refresh() })

  const inputStyle: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 9, padding: '10px 11px', background: '#fff', width: '100%', font: 'inherit' }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* The page header lives here, because the numbers set in it are computed
          here — and the currency picker and Add button ride along with them. */}
      <PageHeader
        eyebrow="Teacher"
        title="Payments"
        figures={[
          { label: 'This month', value: formatMoney(thisMonth, currency) },
          { label: 'Received all-time', value: formatMoney(totalReceived, currency) },
          { label: 'Outstanding', value: formatMoney(totalOutstanding, currency) },
        ]}
        actions={
          <>
            <select
              aria-label="Currency"
              className="k-thead-select"
              value={currency}
              disabled={pending}
              onChange={(e) => startTransition(async () => { await updateTeacherCurrency(e.target.value); router.refresh() })}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c} ({currencySymbol(c)})</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => openAdd()}>+ Add payment</button>
          </>
        }
      />

      {/* Revenue chart */}
      {hasRevenue && (
        <div className="k-sec" style={{ padding: 22 }}>
          <p className="analytics-label" style={{ marginBottom: 12 }}>💰 Revenue — last 12 months</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={buckets} margin={{ top: 4, right: 4, left: -18, bottom: 0 }} barSize={20}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a61c9" /><stop offset="100%" stopColor="#749dc8" stopOpacity={0.75} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${currencySymbol(currency)}${v}`} />
              <Tooltip formatter={(v: any) => formatMoney(Number(v), currency)} contentStyle={{ borderRadius: 11, border: '1px solid var(--line)', fontSize: 12 }} />
              <Bar dataKey="revenue" fill="url(#rev)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Toolbar: the section label and the month the grid is showing. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <h2 className="section-heading" style={{ margin: 0 }}>Students</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 8 }}>
          <button onClick={prevMonth} className="btn btn-ghost btn-sm" aria-label="Previous month">←</button>
          <span style={{ fontWeight: 800, minWidth: 150, textAlign: 'center' }}>{monthLabel}</span>
          <button onClick={nextMonth} className="btn btn-ghost btn-sm" aria-label="Next month">→</button>
        </div>
        <button onClick={() => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()) }} className="btn btn-ghost btn-sm">Today</button>
      </div>

      {/* Students down, the month's days across — the same shape as the notes
          grid, so a teacher reads both the same way. Any cell is a place to add
          a payment, which is why an empty one still offers a +. */}
      {sortedStudents.length === 0 ? (
        <div className="empty">
          <strong style={{ color: 'var(--ink)' }}>No students yet</strong>
          <br />
          Add students before recording payments.
        </div>
      ) : (
        <DragScroller className="notes-scroll">
          <table className="pay-grid pay-days">
            <thead>
              <tr>
                <th className="notes-name-col">Student</th>
                {days.map((d) => (
                  <th key={d.iso} className={`${d.iso === today ? 'is-now' : ''} ${d.weekend ? 'is-weekend' : ''}`}>
                    <div className="pay-mon">{d.day}</div>
                    <div className="pay-yr">{d.weekday}</div>
                  </th>
                ))}
                <th className="pay-total-col">{monthLabel.split(' ')[0]}</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((s) => {
                const c = credits[s.id] ?? { purchased: 0, used: 0, remaining: 0, low: true }
                return (
                  <tr key={s.id}>
                    <td className="notes-name-col">
                      <Link href={`/teacher/students/${s.id}`} title={s.fullName}>{s.fullName}</Link>
                      {/* Lessons left had its own column before. It matters
                          (who has run out) but not enough to cost a column. */}
                      <span
                        className="pay-credits"
                        style={{ color: c.remaining <= 0 ? 'var(--red)' : c.low ? 'var(--amber)' : 'var(--muted)' }}
                      >
                        {c.remaining} left / {c.purchased} bought
                      </span>
                    </td>

                    {days.map((d) => {
                      const list = byDay.get(`${s.id}|${d.iso}`) ?? []
                      const paid = list.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
                      const owed = list.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
                      const has = list.length > 0
                      return (
                        <td key={d.iso} className={`${d.iso === today ? 'is-now' : ''} ${d.weekend && !has ? 'is-weekend' : ''}`}>
                          <button
                            className={`pay-cell${has ? ' has-pay' : ''}${owed ? ' is-owed' : ''}`}
                            // One payment on the day opens it to edit; otherwise
                            // the cell means "add a payment dated this day".
                            onClick={() => (list.length === 1 ? openEdit(list[0]) : openAdd(s.id, d.iso))}
                            title={
                              has
                                ? `${paid > 0 ? `${formatMoney(paid, currency)} paid` : ''}${paid > 0 && owed > 0 ? ', ' : ''}${owed > 0 ? `${formatMoney(owed, currency)} owed` : ''} — click to ${list.length === 1 ? 'edit' : 'add another'}`
                                : `Add a payment on ${d.iso}`
                            }
                          >
                            {has
                              ? <>
                                  {paid > 0 && <b>{formatMoney(paid, currency)}</b>}
                                  {owed > 0 && <i className="pay-owed">{formatMoney(owed, currency)}</i>}
                                </>
                              : <span className="notes-plus">+</span>}
                          </button>
                        </td>
                      )
                    })}

                    <td className="pay-total-col">{formatMoney(monthPaidByStudent.get(s.id) ?? 0, currency)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </DragScroller>
      )}

      {/* Recent payments */}
      {recent.length > 0 && (
        <div>
          <h2 className="section-heading">Recent payments</h2>
          <DragScroller>
          <div className="k-table" style={{ minWidth: 720 }}>
            {recent.map(p => (
              <button key={p.id} className="k-row" style={{ gridTemplateColumns: '92px minmax(120px,1.4fr) 100px 90px 1fr', textAlign: 'left', background: 'none', border: 0, borderTop: '1px solid var(--line)', cursor: 'pointer', width: '100%' }} onClick={() => openEdit(p)}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{(p.payment_date || p.due_date || p.created_at).slice(0, 10)}</span>
                <span style={{ fontWeight: 600 }}>{p.studentName}</span>
                <span style={{ fontWeight: 700 }}>{formatMoney(p.amount, p.currency ?? currency)}</span>
                <span className={`status-pill ${p.status === 'paid' ? 'published' : 'draft'}`}>{p.status}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{p.lessons_covered ? `${p.lessons_covered} lessons` : ''}{p.description ? ` · ${p.description}` : ''}</span>
              </button>
            ))}
          </div>
          </DragScroller>
        </div>
      )}

      {/* Add / edit modal */}
      {mode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(21,23,20,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={close}>
          <div className="surface" style={{ width: '100%', maxWidth: 440, padding: 22, maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>💰 {mode === 'add' ? 'New payment' : 'Edit payment'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {mode === 'add' ? (
                <div className="field"><label>Student</label>
                  <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={inputStyle}>
                    <option value="">Select…</option>
                    {sortedStudents.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                    <option value={TRIAL_ID}>🎓 Trial (not a student)</option>
                    <option value={OTHER_ID}>✨ Other income</option>
                  </select>
                </div>
              ) : <div style={{ fontWeight: 700 }}>{editing?.studentName}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field"><label>Amount ({currencySymbol(currency)})</label><input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" style={inputStyle} autoFocus /></div>
                <div className="field"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} style={inputStyle}><option value="paid">Paid</option><option value="pending">Pending</option></select></div>
              </div>
              <div className="field"><label>What it covers</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. July package — 4 lessons" style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field"><label>{form.status === 'paid' ? 'Payment date' : 'Due date'}</label><input type="date" value={form.status === 'paid' ? form.payment_date : form.due_date} onChange={(e) => setForm(form.status === 'paid' ? { ...form, payment_date: e.target.value } : { ...form, due_date: e.target.value })} style={inputStyle} /></div>
                <div className="field"><label>Lessons covered</label><input type="number" min="0" step="1" value={form.lessons_covered} onChange={(e) => setForm({ ...form, lessons_covered: e.target.value })} placeholder="e.g. 4" style={inputStyle} /></div>
              </div>
              <div className="field"><label>Method</label><input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="Bank transfer, Cash, PayPal…" style={inputStyle} /></div>
              {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 4 }}>
                {mode === 'edit' && editing && (
                  <>
                    <button className="btn btn-danger-ghost btn-sm" disabled={pending} onClick={() => { if (confirm('Delete this payment?')) act(() => deletePayment(editing.id)) }}>Delete</button>
                    {editing.status === 'pending' && <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => act(() => markPaymentPaid(editing.id))}>Mark paid</button>}
                  </>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={close} disabled={pending}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={submit} disabled={pending}>{pending ? 'Saving…' : mode === 'add' ? 'Add' : 'Save'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
