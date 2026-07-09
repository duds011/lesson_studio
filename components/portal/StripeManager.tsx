'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPackage, updatePackage, deletePackage, PackageInput } from '@/app/actions/packages'
import { formatMoney, currencySymbol, CURRENCIES } from '@/lib/currency'

export interface Pkg { id: string; name: string; lessons_count: number; amount: number; currency: string; active: boolean }
export interface StudentOpt { id: string; fullName: string }

const emptyPkg = (currency: string) => ({ name: '', lessons_count: '', amount: '', currency, active: true })

export default function StripeManager({
  connected, chargesEnabled, packages, students, currency, status,
}: { connected: boolean; chargesEnabled: boolean; packages: Pkg[]; students: StudentOpt[]; currency: string; status?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Pkg | null>(null)
  const [form, setForm] = useState(emptyPkg(currency))

  // Generate-link state
  const [linkStudent, setLinkStudent] = useState('')
  const [linkPkg, setLinkPkg] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkErr, setLinkErr] = useState('')
  const [linking, setLinking] = useState(false)
  const [copied, setCopied] = useState(false)

  const input: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 9, padding: '10px 11px', background: '#fff', width: '100%', font: 'inherit' }

  function openAdd() { setForm(emptyPkg(currency)); setEditing(null); setError(''); setMode('add') }
  function openEdit(p: Pkg) { setForm({ name: p.name, lessons_count: String(p.lessons_count), amount: String(p.amount), currency: p.currency, active: p.active }); setEditing(p); setError(''); setMode('edit') }
  function close() { setMode(null); setEditing(null) }

  function submit() {
    const payload: PackageInput = {
      name: form.name.trim(),
      lessons_count: parseInt(form.lessons_count, 10),
      amount: parseFloat(form.amount),
      currency: form.currency,
      active: form.active,
    }
    if (!payload.name) { setError('Name is required'); return }
    if (!(payload.lessons_count > 0)) { setError('Lessons must be greater than zero'); return }
    if (!(payload.amount >= 0)) { setError('Enter a valid amount'); return }
    startTransition(async () => {
      const res = editing ? await updatePackage(editing.id, payload) : await createPackage(payload)
      if (res.success) { close(); router.refresh() } else setError(res.error || 'Failed to save')
    })
  }
  const del = (id: string) => startTransition(async () => { await deletePackage(id); close(); router.refresh() })

  async function generateLink() {
    if (!linkStudent || !linkPkg) { setLinkErr('Pick a student and a package'); return }
    setLinking(true); setLinkErr(''); setLinkUrl(''); setCopied(false)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: linkStudent, packageId: linkPkg }) })
      const json = await res.json()
      if (!json.ok) { setLinkErr(json.error || 'Could not create link'); return }
      setLinkUrl(json.url)
    } catch { setLinkErr('Could not create link') } finally { setLinking(false) }
  }

  const statusBanner = () => {
    if (status === 'connected') return <div className="pill green"><span className="dot" />Stripe connected — you can accept payments</div>
    if (status === 'incomplete') return <div className="pill amber"><span className="dot" />Onboarding not finished — resume below</div>
    if (status === 'error') return <div className="pill amber"><span className="dot" />Something went wrong connecting Stripe — try again</div>
    if (status === 'unconfigured') return <div className="pill amber"><span className="dot" />Stripe isn’t configured on the server yet</div>
    return null
  }

  const activePackages = packages.filter(p => p.active)

  return (
    <div className="analytics-card" style={{ padding: 18, display: 'grid', gap: 16 }}>
      <div>
        <p className="analytics-label" style={{ marginBottom: 2 }}>💳 Card payments (Stripe)</p>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Connect Stripe, define lesson packages, and send students a secure pay link. Paid packages top up their lessons automatically.</span>
      </div>

      {statusBanner()}

      {/* Connection */}
      <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', background: 'var(--surface)' }}>
        <div>
          <strong style={{ fontSize: 13 }}>Stripe account</strong>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            {chargesEnabled ? '✅ Connected — payouts go straight to you.' : connected ? '⏳ Started — finish onboarding to accept payments.' : 'Not connected yet.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {chargesEnabled && (
            <a href="/api/stripe/dashboard" className="btn btn-primary btn-sm" title="See your balance and pay out to your bank">💸 Transfer to bank</a>
          )}
          <a href="/api/stripe/connect/start" className={`btn btn-sm ${chargesEnabled ? 'btn-ghost' : 'btn-primary'}`}>
            {chargesEnabled ? 'Manage' : connected ? 'Finish onboarding' : 'Connect Stripe'}
          </a>
        </div>
      </div>

      {/* Packages */}
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <strong style={{ fontSize: 13 }}>Lesson packages</strong>
          <button className="btn btn-ghost btn-sm" onClick={openAdd} style={{ marginLeft: 'auto' }}>+ Add package</button>
        </div>
        {packages.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>No packages yet — add one (e.g. “4 lessons — {currencySymbol(currency)}120”).</p>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {packages.map(p => (
              <div key={p.id} style={{ border: '1px solid var(--line)', borderRadius: 11, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface)', opacity: p.active ? 1 : 0.55 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 650, fontSize: 13 }}>{p.name} {!p.active && <span className="pill" style={{ fontSize: 10 }}>inactive</span>}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.lessons_count} lesson{p.lessons_count === 1 ? '' : 's'} · {formatMoney(p.amount, p.currency)}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate a payment link */}
      {chargesEnabled && activePackages.length > 0 && students.length > 0 && (
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'grid', gap: 10 }}>
          <strong style={{ fontSize: 13 }}>Send a payment link</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
            <select value={linkStudent} onChange={e => { setLinkStudent(e.target.value); setLinkUrl('') }} style={input}>
              <option value="">Student…</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
            <select value={linkPkg} onChange={e => { setLinkPkg(e.target.value); setLinkUrl('') }} style={input}>
              <option value="">Package…</option>
              {activePackages.map(p => <option key={p.id} value={p.id}>{p.name} — {formatMoney(p.amount, p.currency)}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={generateLink} disabled={linking}>{linking ? 'Creating…' : 'Create link'}</button>
          </div>
          {linkErr && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{linkErr}</p>}
          {linkUrl && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--brand-soft)', borderRadius: 9, padding: '9px 11px' }}>
              <input readOnly value={linkUrl} style={{ ...input, background: '#fff', flex: 1 }} onFocus={e => e.currentTarget.select()} />
              <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard?.writeText(linkUrl); setCopied(true) }}>{copied ? '✓ Copied' : 'Copy'}</button>
            </div>
          )}
        </div>
      )}

      {/* Package add/edit modal */}
      {mode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(21,23,20,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={close}>
          <div className="surface" style={{ width: '100%', maxWidth: 420, padding: 22 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>{mode === 'add' ? 'New package' : 'Edit package'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="field"><label>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Starter pack" style={input} autoFocus /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div className="field"><label>Lessons</label><input type="number" min="1" step="1" value={form.lessons_count} onChange={e => setForm({ ...form, lessons_count: e.target.value })} placeholder="4" style={input} /></div>
                <div className="field"><label>Amount ({currencySymbol(form.currency)})</label><input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="120" style={input} /></div>
                <div className="field"><label>Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} style={input}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                Active (students can buy this)
              </label>
              {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 4 }}>
                {mode === 'edit' && editing && <button className="btn btn-danger-ghost btn-sm" disabled={pending} onClick={() => { if (confirm('Delete this package?')) del(editing.id) }}>Delete</button>}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={close} disabled={pending}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={submit} disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
