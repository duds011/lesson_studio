'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addStudentNote, updateStudentNote, toggleNotePin, deleteStudentNote } from '@/app/actions/notes'

/**
 * The Genoa Library notes grid, in Lesson Studio's clothes: one row per
 * student, one column per day of the month. A note is the teacher's private
 * record of a lesson — what was covered, what to pick up next time — so a
 * month of notes doubles as "how many lessons did I actually teach".
 */

export interface StudentOption {
  id: string
  fullName: string
}

export interface ManagedNote {
  id: string
  studentId: string
  studentName: string
  content: string
  pinned: boolean
  note_date: string // YYYY-MM-DD
  created_at: string
}

const LESSON_MINUTES = 50

const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const isoFor = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

const fmtFullDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

const formatHours = (h: number) => {
  const whole = Math.floor(h)
  const mins = Math.round((h - whole) * 60)
  return mins === 0 ? `${whole}h` : `${whole}h ${mins}m`
}

export default function NotesManager({
  students, notes, lessonsThisMonthByPrefix,
}: {
  students: StudentOption[]
  notes: ManagedNote[]
  /** Published lessons per YYYY-MM, from the lessons table — the recorded count. */
  lessonsThisMonthByPrefix: Record<string, number>
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth()) // 0-based

  // Add / edit modal
  const [mode, setMode] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<ManagedNote | null>(null)
  const [studentId, setStudentId] = useState('')
  const [content, setContent] = useState('')
  const [noteDate, setNoteDate] = useState(todayIso())

  // Day-cell popup (when a cell already has notes)
  const [dayCell, setDayCell] = useState<{ studentId: string; name: string; date: string } | null>(null)

  const byCell = useMemo(() => {
    const m = new Map<string, ManagedNote[]>()
    for (const n of notes) {
      const key = `${n.studentId}|${n.note_date}`
      const arr = m.get(key) ?? []
      arr.push(n)
      m.set(key, arr)
    }
    return m
  }, [notes])

  const sortedStudents = [...students].sort((a, b) => a.fullName.localeCompare(b.fullName))

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dow = new Date(viewYear, viewMonth, day).getDay()
    return { day, iso: isoFor(viewYear, viewMonth, day), weekday: 'SMTWTFS'[dow], weekend: dow === 0 || dow === 6 }
  })
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const today = todayIso()

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
  const monthNotes = notes.filter((n) => n.note_date.startsWith(monthPrefix)).length
  const recordedLessons = lessonsThisMonthByPrefix[monthPrefix] ?? 0

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  function openAdd(presetStudent?: string, presetDate?: string) {
    setStudentId(presetStudent ?? '')
    setContent('')
    setNoteDate(presetDate ?? today)
    setEditing(null)
    setError('')
    setDayCell(null)
    setMode('add')
  }
  function openEdit(n: ManagedNote) {
    setStudentId(n.studentId)
    setContent(n.content)
    setNoteDate(n.note_date)
    setEditing(n)
    setError('')
    setDayCell(null)
    setMode('edit')
  }
  const closeModal = () => { setMode(null); setEditing(null) }

  function handleCellClick(sid: string, name: string, date: string) {
    const cellNotes = byCell.get(`${sid}|${date}`) ?? []
    if (cellNotes.length === 0) openAdd(sid, date)
    else setDayCell({ studentId: sid, name, date })
  }

  function handleSubmit() {
    if (mode === 'add' && !studentId) { setError('Pick a student'); return }
    if (!content.trim()) { setError('The note is empty'); return }
    startTransition(async () => {
      const res = editing
        ? await updateStudentNote(editing.id, editing.studentId, content, noteDate)
        : await addStudentNote(studentId, content, noteDate)
      if (res.success) { closeModal(); router.refresh() }
      else setError(res.error || 'Could not save the note')
    })
  }
  function handleTogglePin(n: ManagedNote) {
    startTransition(async () => { await toggleNotePin(n.id, n.studentId, !n.pinned); router.refresh() })
  }
  function handleDelete(n: ManagedNote) {
    if (!confirm('Delete this note?')) return
    startTransition(async () => { await deleteStudentNote(n.id, n.studentId); closeModal(); setDayCell(null); router.refresh() })
  }

  const dayCellNotes = dayCell ? (byCell.get(`${dayCell.studentId}|${dayCell.date}`) ?? []) : []

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* What the month amounted to. One note = one lesson taught. */}
      <div className="stat-cards" style={{ marginBottom: 0 }}>
        <div className="stat-card" style={{ minHeight: 0, gap: 7 }}>
          <span className="stat-card-label">Lessons in {monthLabel}</span>
          <span className="stat-card-value">{monthNotes}</span>
          <p className="stat-card-note">one note = one lesson</p>
        </div>
        <div className="stat-card" style={{ minHeight: 0, gap: 7 }}>
          <span className="stat-card-label">Hours taught</span>
          <span className="stat-card-value">{formatHours((monthNotes * LESSON_MINUTES) / 60)}</span>
          <p className="stat-card-note">{LESSON_MINUTES} min per lesson</p>
        </div>
        <div className="stat-card" style={{ minHeight: 0, gap: 7 }}>
          <span className="stat-card-label">Recaps published</span>
          <span className="stat-card-value">{recordedLessons}</span>
          <p className="stat-card-note">recorded lessons this month</p>
        </div>
      </div>

      {/* Toolbar: month nav + add */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button onClick={prevMonth} className="btn btn-ghost btn-sm" aria-label="Previous month">←</button>
          <span style={{ fontWeight: 800, minWidth: 150, textAlign: 'center' }}>{monthLabel}</span>
          <button onClick={nextMonth} className="btn btn-ghost btn-sm" aria-label="Next month">→</button>
        </div>
        <button onClick={() => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()) }} className="btn btn-ghost btn-sm">Today</button>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{monthNotes} note{monthNotes === 1 ? '' : 's'} this month</span>
        <button onClick={() => openAdd()} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>+ Add note</button>
      </div>

      {/* The grid: students down, days across */}
      {students.length === 0 ? (
        <div className="empty">
          <strong style={{ color: 'var(--ink)' }}>No students yet</strong>
          <br />
          Add students first to start taking notes.
        </div>
      ) : (
        <div className="notes-scroll">
          <table className="notes-grid">
            <thead>
              <tr>
                <th className="notes-name-col">Student</th>
                {days.map((d) => (
                  <th key={d.iso} className={`${d.iso === today ? 'is-today' : ''} ${d.weekend ? 'is-weekend' : ''}`}>
                    <div className="notes-day">{d.day}</div>
                    <div className="notes-dow">{d.weekday}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((s) => (
                <tr key={s.id}>
                  <td className="notes-name-col">
                    <Link href={`/teacher/students/${s.id}`} title={s.fullName}>{s.fullName}</Link>
                  </td>
                  {days.map((d) => {
                    const cellNotes = byCell.get(`${s.id}|${d.iso}`) ?? []
                    const has = cellNotes.length > 0
                    const pinned = cellNotes.some((n) => n.pinned)
                    return (
                      <td key={d.iso} className={d.weekend && !has ? 'is-weekend' : ''}>
                        <button
                          onClick={() => handleCellClick(s.id, s.fullName, d.iso)}
                          title={has ? cellNotes[0].content : 'Add note'}
                          className={`notes-cell ${has ? (pinned ? 'has-pin' : 'has-note') : ''}`}
                        >
                          {has
                            ? cellNotes.length > 1
                              ? <b>{cellNotes.length}</b>
                              : <i className="notes-dot" />
                            : <span className="notes-plus">+</span>}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>
        Click any cell to add or read a note. A dot is a note, amber is pinned, numbers mean several that day.
      </p>

      {/* ── Day popup: the notes already on that cell ── */}
      {dayCell && (
        <div className="modal-scrim" onClick={() => setDayCell(null)}>
          <div className="modal-card" style={{ maxWidth: 460, padding: 22 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0 }}>{dayCell.name}</h3>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>{fmtFullDate(dayCell.date)}</p>
              </div>
              <button className="close-btn" onClick={() => setDayCell(null)} aria-label="Close">✕</button>
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {dayCellNotes.map((n) => (
                <div key={n.id} className="notes-entry" data-pinned={n.pinned || undefined}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.55 }}>{n.content}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(n)}>Edit</button>
                    <button className="btn btn-ghost btn-sm" disabled={pending} onClick={() => handleTogglePin(n)}>{n.pinned ? 'Unpin' : 'Pin'}</button>
                    <button className="btn btn-danger-ghost btn-sm" disabled={pending} onClick={() => handleDelete(n)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => openAdd(dayCell.studentId, dayCell.date)} className="btn btn-ghost btn-sm" style={{ marginTop: 14, width: '100%' }}>
              + Add another note this day
            </button>
          </div>
        </div>
      )}

      {/* ── Add / edit ── */}
      {mode && (
        <div className="modal-scrim" onClick={closeModal}>
          <div className="modal-card" style={{ maxWidth: 460, padding: 22 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0 }}>{mode === 'add' ? 'New note' : 'Edit note'}</h3>
              <button className="close-btn" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label className="field" style={{ margin: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>Student</span>
                  {mode === 'add' ? (
                    <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="review-input">
                      <option value="">Select…</option>
                      {sortedStudents.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                    </select>
                  ) : (
                    <strong style={{ fontSize: 14, paddingTop: 6 }}>{editing?.studentName}</strong>
                  )}
                </label>
                <label className="field" style={{ margin: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>Date</span>
                  <input type="date" value={noteDate} onChange={(e) => setNoteDate(e.target.value)} className="review-input" />
                </label>
              </div>

              <label className="field" style={{ margin: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Note</span>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  autoFocus
                  placeholder="e.g. Left off at chapter 5. Struggling with past tense. Next time: travel vocab."
                  className="review-input"
                  style={{ resize: 'vertical' }}
                />
              </label>

              {error && <p style={{ color: 'var(--red)', fontSize: 12, margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {mode === 'edit' && editing && (
                  <button onClick={() => handleDelete(editing)} disabled={pending} className="btn btn-danger-ghost btn-sm">Delete</button>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button onClick={closeModal} className="btn btn-ghost btn-sm" disabled={pending}>Cancel</button>
                  <button onClick={handleSubmit} className="btn btn-primary btn-sm" disabled={pending}>
                    {pending ? 'Saving…' : mode === 'add' ? 'Add note' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
