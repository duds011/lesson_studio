'use client'

import { useT } from '@/components/I18nProvider'
import { fill } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createStudent } from '@/app/actions/portal-students'
import { languageOptions, SPOKEN_LANGUAGES } from '@/lib/languages'
import InviteLink from '@/components/portal/InviteLink'
import { tourDid } from '@/lib/tour'

/**
 * The values STORED on the student row, so they stay English — a level
 * written in French would not match one written in Japanese for the same
 * student. t.addStudent.levels supplies what the teacher reads, by index.
 */
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
})

export default function AddStudentForm({ teachingLanguage = '', speakingLanguage = '' }: { teachingLanguage?: string; speakingLanguage?: string }) {
  const t = useT()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // Set once the student exists. Its presence swaps the form out for the link
  // window — the teacher's next job is to send the link, not to fill anything.
  const [created, setCreated] = useState<{ name: string; inviteCode?: string } | null>(null)
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
      setError(res.error || t.addStudent.createFailed)
      return
    }

    setBusy(false)
    setCreated({ name: form.full_name, inviteCode: res.inviteCode })
    // The tour's third step is waiting on exactly this, and only this: the
    // student existing. Not the form opening, not the button being pressed.
    tourDid('student-created')
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
    <button
      className="btn btn-primary"
      data-tour="add-student"
      onClick={() => { setOpen(true); setCreated(null); tourDid('add-student-open') }}
    >
      {t.addStudent.trigger}
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
      aria-label={t.addStudent.aria}
      // Clicking the backdrop must not silently discard an unread invite link.
      onClick={(e) => { if (e.target === e.currentTarget && !created) setOpen(false) }}
    >
      {/* Two windows, never both: the form, then the link. Once the student
          exists there is nothing left to fill in, and leaving the fields on
          screen behind a success banner buried the one thing that matters. */}
      {created ? (
        <div className="k-modal-card" data-tour="invite-link" style={{ maxWidth: 460, textAlign: 'center', color: 'var(--ink)' }}>
          <div className="k-join-mark" style={{ margin: '0 auto 16px' }} aria-hidden>🔗</div>
          <h3 style={{ margin: 0, fontSize: 20, color: 'var(--ink)', letterSpacing: '-.02em' }}>
            {fill(t.addStudent.inviteTitle, { name: created.name })}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '10px 0 0', lineHeight: 1.6 }}>
            {t.addStudent.inviteBody}
          </p>

          {created.inviteCode && <InviteLink code={created.inviteCode} />}

          <button className="k-modal-cta" onClick={finish}>{t.common.done}</button>
          <button
            onClick={() => setCreated(null)}
            style={{ marginTop: 12, background: 'none', border: 0, font: 'inherit', fontSize: 12.5, color: 'var(--muted)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {t.addStudent.addAnother}
          </button>
          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '10px 0 0' }}>
            {fill(t.addStudent.copyAgain, { name: created.name })}
          </p>
        </div>
      ) : (
        <div className="k-modal-card" data-tour="add-student-form">
        <div className="settings-row" style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>{t.addStudent.title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>{t.common.close}</button>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label>{t.addStudent.fullName}</label>
            <input value={form.full_name} onChange={set('full_name')} required placeholder={t.addStudent.namePlaceholder} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>{t.addStudent.level}</label>
              <select value={form.level} onChange={set('level')} style={inputStyle}>
                {LEVELS.map((l, i) => <option key={l} value={l}>{t.addStudent.levels[i]}</option>)}
              </select>
            </div>
            <div className="field">
              <label>{t.addStudent.learning}</label>
              <select value={form.language} onChange={set('language')} required style={inputStyle}>
                <option value="" disabled>{t.addStudent.choose}</option>
                {languageOptions(teachingLanguage).map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>{t.addStudent.recapLanguage}</label>
            <select value={form.instruction_language} onChange={set('instruction_language')} required style={inputStyle}>
              {SPOKEN_LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
            <p style={{ fontSize: 11, color: 'var(--muted)', margin: '4px 0 0' }}>
              The language this student reads. Their recaps, word meanings and test questions are written in it —
              not the language they are learning.
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
