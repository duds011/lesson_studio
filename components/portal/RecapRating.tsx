'use client'

import { useState } from 'react'
import { rateRecap } from '@/app/actions/rate-recap'
import { RATING_REASONS } from '@/lib/ratings'

/**
 * One question at the foot of a student's recap.
 *
 * Student view only, and worded about the WRITE-UP rather than the lesson —
 * "Did this match your lesson?", never "How was your lesson?". The second is a
 * review of the teacher, and a tool that invites students to grade the person
 * paying for it is a tool that teacher stops using. The teacher sees the
 * reasons a student gave for their own lessons; they never see a score, and
 * there is no average anywhere.
 *
 * Kept deliberately close to Lesson Journal's copy — same question, same
 * reasons, same shape — so answers from both products count together.
 */
export default function RecapRating({
  lessonId,
  initial,
  accent,
}: {
  lessonId: string
  initial: { matched: boolean; reasons: string[]; note: string | null } | null
  accent?: string
}) {
  const [saved, setSaved] = useState(initial)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [reasons, setReasons] = useState<string[]>(initial?.reasons ?? [])
  const [note, setNote] = useState(initial?.note ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // The teacher's own accent when their brand sets one, so the student sees
  // their studio rather than ours. --forest is the token everything else here
  // falls back to.
  const tint = accent || 'var(--forest)'

  async function send(matched: boolean) {
    setBusy(true)
    setError('')
    const res = await rateRecap({ lessonId, matched, reasons, note })
    setBusy(false)
    if (!res.ok) {
      setError(res.error ?? 'That did not save.')
      return
    }
    setSaved({ matched, reasons: matched ? [] : reasons, note: matched ? null : note || null })
    setOpen(false)
    setEditing(false)
  }

  function toggle(key: string) {
    setReasons((r) => (r.includes(key) ? r.filter((k) => k !== key) : [...r, key]))
  }

  if (saved && !editing) {
    return (
      <div className="k-rate k-rate--done">
        <span>
          {saved.matched
            ? 'You said this one matched your lesson. Thank you — it is read.'
            : 'You said this one was off. Thank you — that is the useful kind.'}
        </span>
        <button
          type="button"
          className="k-rate-link"
          onClick={() => {
            setEditing(true)
            setOpen(!saved.matched)
          }}
        >
          Change
        </button>
      </div>
    )
  }

  return (
    <div className="k-rate">
      <p className="k-rate-q">Did this match your lesson?</p>
      <p className="k-rate-sub">
        The write-up is put together by a model from a recording of the hour, so it can
        get things wrong — and you are the only one who was there to notice.
      </p>

      {!open ? (
        <div className="k-rate-row">
          <button
            type="button"
            className="k-btn-pill"
            style={{ background: tint, color: '#fff', borderColor: tint }}
            disabled={busy}
            onClick={() => send(true)}
          >
            {busy ? 'Saving…' : 'Yes, that was my lesson'}
          </button>
          <button type="button" className="k-btn-pill k-btn-outline" disabled={busy} onClick={() => setOpen(true)}>
            Not quite
          </button>
        </div>
      ) : (
        <>
          <p className="k-rate-sub" style={{ marginTop: 14, fontWeight: 650, color: 'var(--ink)' }}>
            What was off? Pick any that fit.
          </p>
          <div className="k-rate-reasons">
            {RATING_REASONS.map((r) => (
              <label key={r.key} className={`k-rate-reason${reasons.includes(r.key) ? ' on' : ''}`}>
                <input type="checkbox" checked={reasons.includes(r.key)} onChange={() => toggle(r.key)} />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          <textarea
            className="k-rate-note"
            rows={3}
            maxLength={600}
            placeholder="If you can, say which part — a sentence is plenty."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {error && <p className="k-error">{error}</p>}

          <div className="k-rate-row">
            <button
              type="button"
              className="k-btn-pill"
              style={{ background: tint, color: '#fff', borderColor: tint }}
              disabled={busy}
              onClick={() => send(false)}
            >
              {busy ? 'Sending…' : 'Send'}
            </button>
            <button
              type="button"
              className="k-btn-pill k-btn-outline"
              disabled={busy}
              onClick={() => {
                setOpen(false)
                setEditing(false)
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
