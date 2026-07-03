'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStudent } from '@/app/actions/portal-students'

const LEVELS = ['Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced']

function randomPassword() {
  return Math.random().toString(36).slice(-8) + 'A1!'
}

export default function AddStudentForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: randomPassword(),
    language: 'Japanese',
    level: 'Beginner',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const res = await createStudent(form)
    setBusy(false)
    if (!res.success) {
      setError(res.error || 'Could not create student')
      return
    }
    setCreated({ email: form.email, password: form.password })
    setForm({ full_name: '', email: '', password: randomPassword(), language: 'Japanese', level: 'Beginner' })
    router.refresh()
  }

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => { setOpen(true); setCreated(null) }}>
        + Add student
      </button>
    )
  }

  return (
    <div className="settings-card" style={{ padding: 22 }}>
      <div className="settings-row" style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0 }}>New student account</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Close</button>
      </div>

      {created ? (
        <div>
          <div className="warn-box" style={{ borderColor: '#9dd0b4', background: 'var(--green-soft)', color: 'var(--green)' }}>
            <strong>Account created.</strong> Share these credentials with the student:
          </div>
          <div className="lesson-block" style={{ marginTop: 12, padding: 16 }}>
            <div className="talk-row"><span>Email</span><strong>{created.email}</strong></div>
            <div className="talk-row" style={{ borderBottom: 0 }}><span>Password</span><strong>{created.password}</strong></div>
          </div>
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
              <select value={form.level} onChange={set('level')} style={{ border: '1px solid var(--line)', borderRadius: 9, padding: '11px 12px', background: '#fff' }}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Language</label>
              <input value={form.language} onChange={set('language')} required />
            </div>
          </div>

          {error && <div className="warn-box" style={{ marginTop: 8, borderColor: '#f0cece', background: 'var(--red-soft)', color: 'var(--red)' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={busy} style={{ marginTop: 14 }}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
      )}
    </div>
  )
}
