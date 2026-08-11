'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { adminDeleteTeacher, adminDeleteStudent } from '@/app/actions/admin'

/**
 * The destructive button, with a typed confirmation for teachers.
 *
 * Deleting a teacher takes their students, lessons and payments with them, so
 * a click-through confirm() is not enough friction — the admin types the
 * account's name. Deleting a single student keeps the lighter confirm.
 */
export default function AdminDeleteButton({ kind, id, name }: {
  kind: 'teacher' | 'student'
  id: string
  name: string
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [msg, setMsg] = useState('')

  const run = () => {
    if (kind === 'teacher') {
      const typed = prompt(
        `This deletes ${name}'s account AND every student, lesson, recap and payment under it. It cannot be undone.\n\nType the teacher's name (${name}) to confirm:`,
      )
      if (typed?.trim().toLowerCase() !== name.trim().toLowerCase()) {
        if (typed !== null) setMsg('Name did not match — nothing deleted.')
        return
      }
    } else if (!confirm(`Delete ${name} and all their lessons? This cannot be undone.`)) {
      return
    }
    setMsg('')
    start(async () => {
      const res = kind === 'teacher' ? await adminDeleteTeacher(id) : await adminDeleteStudent(id)
      if (!res.success) { setMsg(res.error || 'Delete failed'); return }
      if (res.warnings?.length) setMsg(`Deleted, with warnings: ${res.warnings.join(' · ')}`)
      router.refresh()
    })
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button className="btn btn-danger-ghost btn-sm" onClick={run} disabled={pending}>
        {pending ? 'Deleting…' : 'Delete'}
      </button>
      {msg && <span style={{ fontSize: 11, color: 'var(--red)' }}>{msg}</span>}
    </span>
  )
}
