'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createStudent } from '@/app/actions/portal-students'
import { addPayment } from '@/app/actions/payments'
import { currencySymbol } from '@/lib/currency'
import { languageOptions, SPOKEN_LANGUAGES } from '@/lib/languages'
import InviteLink from '@/components/portal/InviteLink'

const LEVELS = ['Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced']

// The language defaults to what THIS teacher teaches, not to Japanese. The
// hardcoded default is how an English teacher's student ended up marked as
// learning Japanese and got a JLPT-style recap for an English lesson.
const emptyForm = (defaultLanguage: string, defaultInstruction: string) => ({
  full_name: '', language: defaultLanguage || 'English', level: 'Beginner',
  // What recaps and tests are EXPLAINED in — defaults to the language the
  // teacher said they explain in, since that is usually every student's.
  instruction_language: /^english$/i.test(defaultInstruction.trim()) ? '' : defaultInstruction.trim(),
  // Optional starting package. No payment method: it was one more box between
  // the teacher and a saved student, and Payments is where that belongs.
  lessons: '', amount: '',
})

export default function AddStudentForm({ currency = 'USD', teachingLanguage = '', speakingLanguage = '' }: { currency?: string; teachingLanguage?: string; speakingLanguage?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Set once the student exists. Its presence swaps the form out for the link
  // window — the teacher's next job is to send the link, not to fill anything.
  const [created, setCreated] = useState<{ name: string; note?: string; inviteCode?: string } | null>(null)
  const [form, setForm] = useState(emptyForm(teachingLanguage, speakingLanguage))
  // document.body does not exist during the server render.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const set = (k: keyof ReturnType<typeof emptyForm>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')

    // No email is passed at all: this form always creates an invited student.
    // A teacher who already has the address can still set a login afterwards
    // from the student's row.
    const res = await createStudent({
      full_name: form.full_name,
      language: form.language, level: form.level,
      instruction_language: form.instruction_language,
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
        method: '',
      })
      note = pay.success
        ? (lessons > 0 ? `${lessons} lessons added to their balance.` : 'Payment recorded.')
        : `Student created, but the payment failed: ${pay.error}`
    }

    setBusy(false)
    setCreated({ name: form.full_name, note, inviteCode: res.inviteCode })
    setForm(emptyForm(teachingLanguage, speakingLanguage))
    // No router.refresh() here. Refreshing re-renders the tree this modal is
    // mounted in, which threw away `created` and closed the link window before
    // the teacher could read it. The new student appears when they dismiss it.
  }

  /** Close the link window, and only now pull the new student into the list. */
  function finish() {
    setCreated(null)
    setOpen(false)
    router.refresh()
  }

  const inputStyle: React.CSSProperties = { border: '1px solid var(--line)', borderRadius: 9, padding: '11px 12px', background: '#fff' }

  const trigger = (
    <button className="btn btn-primary" onClick={() => { setOpen(true); setCreated(null) }}>
      + Add student
    </button>
  )
  if (!open) return trigger

  /**
   * The dialog is portalled to <body>, not left where this component sits.
   *
   * This button lives in the page header, and `.k-thead` paints everything
   * inside it white for the dark band. Rendered in place, the modal inherited
   * that: a white heading and white ghost buttons on a white card, all
   * invisible. Moving it out of the header is the fix for every one of those
   * at once, instead of overriding colours one element at a time.
   */
  const dialog = (
    <div
      className="k-modal"
      role="dialog"
      aria-modal="true"
      aria-label="New student"
      // Clicking the backdrop must not silently discard an unread invite link.
      onClick={(e) => { if (e.target === e.currentTarget && !created) setOpen(false) }}
    >
      {/* Two windows, never both: the form, then the link. Once the student
          exists there is nothing left to fill in, and leaving the fields on
          screen behind a success banner buried the one thing that matters. */}
      {created ? (
        <div className="k-modal-card" style={{ maxWidth: 460, textAlign: 'center', color: 'var(--ink)' }}>
          <div className="k-join-mark" style={{ margin: '0 auto 16px' }} aria-hidden>🔗</div>
          <h3 style={{ margin: 0, fontSize: 20, color: 'var(--ink)', letterSpacing: '-.02em' }}>
            Invite link for {created.name}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '10px 0 0', lineHeight: 1.6 }}>
            Send this to them however you normally talk. They open it, pick their own email and password, and land
            in your workspace ready to go.
          </p>

          {created.inviteCode && <InviteLink code={created.inviteCode} />}
          {created.note && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{created.note}</p>}

          <button className="k-modal-cta" onClick={finish}>Done</button>
          <button
            onClick={() => setCreated(null)}
            style={{ marginTop: 12, background: 'none', border: 0, font: 'inherit', fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Add another student
          </button>
          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '10px 0 0' }}>
            You can copy this again any time from {created.name}&rsquo;s row.
          </p>
        </div>
      ) : (
        <div className="k-modal-card">
        <div className="settings-row" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>New student</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Close</button>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Full name</label>
            <input value={form.full_name} onChange={set('full_name')} required placeholder="Jane Doe" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Level</label>
              <select value={form.level} onChange={set('level')} style={inputStyle}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Learning</label>
              <select value={form.language} onChange={set('language')} required style={inputStyle}>
                {languageOptions(teachingLanguage).map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Explain lessons in <span style={{ fontWeight: 500, color: 'var(--muted)' }}>(optional)</span></label>
            <select value={form.instruction_language} onChange={set('instruction_language')} style={inputStyle}>
              <option value="">English</option>
              {SPOKEN_LANGUAGES.filter((l) => !/^english$/i.test(l)).map((l) => <option key={l}>{l}</option>)}
            </select>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '4px 0 0' }}>
              Recap explanations, definitions and test questions are written in this language.
            </p>
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
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>Leave blank if they haven&rsquo;t paid yet — you can record it later in Payments.</p>
          </div>

          {error && <div className="warn-box" style={{ marginTop: 8, borderColor: '#f0cece', background: 'var(--red-soft)', color: 'var(--red)' }}>{error}</div>}

          {/* Says what actually happens next, because what happens next is the
              teacher copying a link — not a saved record they never see. */}
          <button type="submit" className="k-modal-cta" disabled={busy}>
            {busy ? 'Generating…' : 'Generate link'}
          </button>
        </form>
        </div>
      )}
    </div>
  )

  return (
    <>
      {trigger}
      {mounted && createPortal(dialog, document.body)}
    </>
  )
}
