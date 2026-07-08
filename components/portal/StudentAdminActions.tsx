'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAuthForExistingStudent, resetStudentPassword, deleteStudent } from '@/app/actions/portal-students'

export default function StudentAdminActions({ studentId, hasLogin }: { studentId: string; hasLogin: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function setupLogin() {
    setBusy(true)
    const res = await createAuthForExistingStudent(studentId)
    setBusy(false)
    if (res.success) {
      setNotice(`Login created · temp password: ${res.tempPassword}`)
      router.refresh()
    } else setNotice(res.error || 'Failed')
  }

  async function resetPw() {
    const pw = Math.random().toString(36).slice(-8) + 'A1!'
    setBusy(true)
    const res = await resetStudentPassword(studentId, pw)
    setBusy(false)
    setNotice(res.success ? `New password: ${pw}` : res.error || 'Failed')
  }

  async function remove() {
    if (!confirm('Delete this student and all their lessons? This cannot be undone.')) return
    setBusy(true)
    const res = await deleteStudent(studentId)
    setBusy(false)
    if (res.success) { router.push('/teacher/dashboard'); router.refresh() }
    else setNotice(res.error || 'Failed')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {hasLogin ? (
          <button className="btn btn-ghost btn-sm" onClick={resetPw} disabled={busy}>Reset password</button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={setupLogin} disabled={busy}>Set up login</button>
        )}
        <button className="btn btn-danger-ghost btn-sm" onClick={remove} disabled={busy}>Delete</button>
      </div>
      {notice && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{notice}</span>}
    </div>
  )
}
