'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DraftRecap } from './RecapReview'
import { reassignRecapStudent } from '@/app/actions/recordings'

/**
 * The review queue: recaps built from recordings, waiting for the teacher.
 *
 * Styled as a first-class section (k-sec) because it IS the page's main
 * event — it used to float below the overview grid in leftover classes from
 * the old design, which read as a broken afterthought, and a draft was
 * invisible in "Latest lessons" (no lesson row exists until publish) while
 * appearing only in that orphan. One queue, at the top, in the same clothes
 * as everything else.
 */
export default function RecapsToReview({
  drafts,
  students = [],
}: {
  drafts: DraftRecap[]
  /** For moving a recap that came in under the wrong name. */
  students?: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState('')
  const [retrying, setRetrying] = useState('')
  const [moving, setMoving] = useState('')

  const building = drafts.filter((d) => d.status === 'processing').length

  /**
   * A recap that is still building has no way to announce itself.
   *
   * It is written by a background job on the server, so this page has no idea
   * when it lands — "Transcribing and writing the recap" sat there until the
   * teacher happened to reload, which meant sitting and waiting for something
   * that had often finished minutes ago. While anything is building, ask the
   * server again every few seconds; the moment none are, stop asking.
   */
  useEffect(() => {
    if (building === 0) return
    const id = setInterval(() => router.refresh(), 6000)
    return () => clearInterval(id)
  }, [building, router])

  /**
   * Put this recap on a different student and build it again.
   *
   * Rebuilding is the point: the recap names the student throughout and is
   * graded against the language on their record, so re-linking alone would
   * leave the old student's recap wearing a new name. The transcript is
   * already cached, so this does not go near the audio a second time.
   */
  async function moveTo(d: DraftRecap, studentId: string) {
    if (!studentId) return
    const name = students.find((s) => s.id === studentId)?.name ?? 'this student'
    if (!confirm(`Move this lesson to ${name} and rebuild the recap?`)) return

    setMoving(d.eventId)
    const res = await reassignRecapStudent(d.eventId, studentId)
    if (!res.success) {
      setMoving('')
      alert(res.error || 'Could not move this recap')
      return
    }
    await fetch('/api/recap/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: d.eventId }),
    }).catch(() => { /* the card shows as failed with a Try again either way */ })
    setMoving('')
    router.refresh()
  }

  if (drafts.length === 0) return null

  const waiting = drafts.filter((d) => d.status === 'draft').length
  const broken = drafts.filter((d) => d.status === 'failed').length

  /** Rebuild from the audio, which is kept for 30 days. */
  async function retry(d: DraftRecap) {
    setRetrying(d.eventId)
    const res = await fetch('/api/recap/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: d.eventId }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Could not reach the server' }))
    setRetrying('')
    if (!res.ok) {
      alert(res.error || 'Could not rebuild this recap')
      return
    }
    router.refresh()
  }

  const fmtWhen = (d?: string | number) => d ? new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
  async function deleteDraft(d: DraftRecap) {
    if (!confirm(`Delete ${d.studentName}'s draft recap? This removes it from Recaps to review and cannot be undone.`)) return
    setDeleting(d.eventId)
    const res = await fetch('/api/recap', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: d.eventId }),
    }).then((x) => x.json()).catch(() => ({ ok: false, error: 'Could not delete recap' }))
    setDeleting('')
    if (!res.ok) {
      alert(res.error || 'Could not delete recap')
      return
    }
    router.refresh()
  }

  return (
    <section className="k-sec">
      <div className="k-sec-head">
        <span className="k-sec-icon" aria-hidden>📝</span>
        <div>
          <h3>
            Recaps to review{' '}
            {waiting > 0 && (
              <span className="pill" style={{ background: 'var(--amber-soft)', color: 'var(--amber)', verticalAlign: 'middle' }}>
                {waiting} waiting
              </span>
            )}{' '}
            {building > 0 && (
              <span className="pill" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', verticalAlign: 'middle' }}>
                {building} building
              </span>
            )}{' '}
            {broken > 0 && (
              <span className="pill" style={{ background: 'var(--red-soft)', color: 'var(--red)', verticalAlign: 'middle' }}>
                {broken} failed
              </span>
            )}
          </h3>
          <p className="desc">Built from your recordings. Nothing reaches a student until you review and send it.</p>
        </div>
      </div>

      <div>
        {drafts.map((d) => {
          const isBuilding = d.status === 'processing'
          const isBroken = d.status === 'failed'
          return (
            <div key={d.eventId} className="lesson-card" style={{ gridTemplateColumns: 'auto 1fr auto', cursor: 'default' }}>
              <span className="lc-num">{isBroken ? '⚠️' : isBuilding ? '⏳' : d.lessonNumber ? `#${d.lessonNumber}` : '📝'}</span>
              <div>
                <div className="lc-title" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {d.studentName}
                  {students.length > 1 && !isBuilding && (
                    <select
                      aria-label="Move to another student"
                      value=""
                      disabled={moving === d.eventId}
                      onChange={(e) => moveTo(d, e.target.value)}
                      style={{
                        border: '1px solid var(--line)', borderRadius: 8, padding: '3px 6px',
                        font: 'inherit', fontSize: 11, fontWeight: 500, color: 'var(--muted)', background: '#fff',
                      }}
                    >
                      <option value="">{moving === d.eventId ? 'Moving…' : 'Wrong student?'}</option>
                      {students.filter((s) => s.name !== d.studentName).map((s) => (
                        <option key={s.id} value={s.id}>Move to {s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="lc-meta">
                  {isBuilding
                    ? 'Transcribing and writing the recap — this takes a few minutes.'
                    : isBroken
                      // The reason, not a shrug: it is usually actionable, and
                      // the audio is still there either way.
                      ? `Could not be built — ${d.error || 'the recap step failed'}. The recording is safe.`
                      : `${d.lessonNumber ? `Lesson ${d.lessonNumber} · ` : ''}${fmtWhen(d.lessonDate || d.createdAt)}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {isBuilding ? (
                  <span className="pill" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>Building…</span>
                ) : (
                  <>
                    <button className="btn btn-danger-ghost btn-sm" disabled={deleting === d.eventId} onClick={() => deleteDraft(d)}>
                      {deleting === d.eventId ? 'Deleting…' : 'Delete'}
                    </button>
                    {isBroken ? (
                      <button className="btn btn-primary btn-sm" disabled={retrying === d.eventId} onClick={() => retry(d)}>
                        {retrying === d.eventId ? 'Rebuilding…' : '↻ Try again'}
                      </button>
                    ) : (
                      <Link className="btn btn-primary btn-sm" href={`/teacher/recap/${encodeURIComponent(d.eventId)}`}>Review &amp; send</Link>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
