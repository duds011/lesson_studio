'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resetStudentPassword, deleteStudent, studentInviteCode } from '@/app/actions/portal-students'
import InviteLink from '@/components/portal/InviteLink'

export default function StudentAdminActions({ studentId, hasLogin }: { studentId: string; hasLogin: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [invite, setInvite] = useState('')

  async function showInvite() {
    setBusy(true)
    setNotice('')
    const res = await studentInviteCode(studentId)
    setBusy(false)
    if (res.code) setInvite(res.code)
    else setNotice(res.error || 'Failed')
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
          // One way in for a student who has not joined: their own link. The
          // "Set up login" button needed an email the teacher usually does not
          // have, and made them read a password out loud when they did.
          <button className="btn btn-ghost btn-sm" onClick={showInvite} disabled={busy}>Invite link</button>
        )}
        <button className="btn btn-danger-ghost btn-sm" onClick={remove} disabled={busy}>Delete</button>
      </div>
      {invite && <div style={{ width: 320, maxWidth: '100%' }}><InviteLink code={invite} compact /></div>}
      {notice && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{notice}</span>}
    </div>
  )
}
