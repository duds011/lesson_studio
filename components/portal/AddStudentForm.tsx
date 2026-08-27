'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createStudent } from '@/app/actions/portal-students'
import { addPayment } from '@/app/actions/payments'
import { languageOptions, SPOKEN_LANGUAGES } from '@/lib/languages'
import InviteLink from '@/components/portal/InviteLink'

const LEVELS = ['Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced']

// Learning starts empty and has to be chosen. It used to inherit a
// teacher-level answer given once during onboarding, which made a per-account
// fact out of something that differs per student — one teacher can teach two
// languages, and the wrong value here picks the wrong recap prompt entirely.
const emptyForm = (defaultLanguage: string, defaultInstruction: string) => ({
  full_name: '', language: defaultLanguage || '', level: 'Beginner',
  // What recaps and tests are WRITTEN in. Required, and pre-filled with the
  // teacher's own answer — it was optional-and-blank before, which read as
  // "leave it" and quietly meant English for students who could not read it.
  instruction_language: defaultInstruction.trim() || 'English',
  // How many lessons they have in hand. Not a price and not a payment — money
  // lives in Payments. This is the number the balance counts down from as
  // recaps are published, and the only reason it is asked for here is that a
  // teacher adding a student almost always knows it.
  lessons: '',
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

    // The balance is Σ paid payments' lessons_covered − published lessons, so
    // the starting count is still written as a payment row — with no amount,
    // because this is a lesson count and not a sale. Recording it any other way
    // would need a second source of truth for the same number.
    const lessons = form.lessons ? parseInt(form.lessons, 10) : 0
    let note = ''
    if (lessons > 0) {
      const pay = await addPayment(res.studentId, {
        amount: 0, currency, status: 'paid',
        description: `${lessons} lesson${lessons === 1 ? '' : 's'} to start`,
        lessons_covered: lessons,
        payment_date: new Date().toISOString().slice(0, 10),
        method: '',
      })
      note = pay.success
        ? `${lessons} lesson${lessons === 1 ? '' : 's'} on their balance — it counts down as you publish recaps.`
        : `Student created, but the lesson count failed to save: ${pay.error}`
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
                <option value="" disabled>Choose…</option>
                {languageOptions(teachingLanguage).map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Recap language</label>
            <select value={form.instruction_language} onChange={set('instruction_language')} required style={inputStyle}>
              {SPOKEN_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '4px 0 0' }}>
              The language this student reads. Their recaps, word meanings and test questions are written in it —
              not the language they are learning.
            </p>
          </div>

          {/* How many lessons they have. One number, no money — the teacher
              gets warned when it runs down, which is the whole point of it. */}
          <div style={{ borderTop: '1px solid var(--line)', margin: '8px 0 4px', paddingTop: 12 }}>
            <div className="field" style={{ maxWidth: 220 }}>
              <label>Lessons they have</label>
              <input
                type="number" min="0" step="1" inputMode="numeric"
                value={form.lessons} onChange={set('lessons')}
                placeholder="e.g. 4" style={inputStyle}
              />
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>
              Counts down by one each time you publish a recap, and warns you when they are nearly
              out. Leave it blank if you don&rsquo;t track lessons this way.
            </p>
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
