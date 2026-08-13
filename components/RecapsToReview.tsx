'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DraftRecap } from './RecapReview'

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
export default function RecapsToReview({ drafts }: { drafts: DraftRecap[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState('')
  const [retrying, setRetrying] = useState('')

  if (drafts.length === 0) return null

  const waiting = drafts.filter((d) => d.status === 'draft').length
  const building = drafts.filter((d) => d.status === 'processing').length
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
                <div className="lc-title">{d.studentName}</div>
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
