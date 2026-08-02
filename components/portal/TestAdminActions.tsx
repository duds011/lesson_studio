'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Publish / unpublish / delete controls on the teacher's test review page.
export default function TestAdminActions({ testId, studentId, status }: { testId: string; studentId: string; status: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<'publish' | 'unpublish' | 'delete' | null>(null)
  const [error, setError] = useState('')

  async function act(action: 'publish' | 'unpublish' | 'delete') {
    if (action === 'delete' && !confirm('Delete this test? This cannot be undone.')) return
    setBusy(action); setError('')
    try {
      const res = await fetch('/api/tests', {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'delete' ? { testId } : { testId, action }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Action failed')
      if (action === 'delete') router.push(`/teacher/students/${studentId}`)
      else router.refresh()
    } catch (e: any) {
      setError(e?.message || 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {error && <span style={{ color: 'var(--red)', fontSize: 11 }}>{error}</span>}
      {status === 'draft' ? (
        <button className="btn btn-green btn-sm" onClick={() => act('publish')} disabled={busy !== null}>
          {busy === 'publish' ? 'Publishing…' : 'Publish to student'}
        </button>
      ) : (
        <button className="btn btn-ghost btn-sm" onClick={() => act('unpublish')} disabled={busy !== null}>
          {busy === 'unpublish' ? 'Working…' : 'Unpublish'}
        </button>
      )}
      <button className="btn btn-danger-ghost btn-sm" onClick={() => act('delete')} disabled={busy !== null}>
        {busy === 'delete' ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  )
}
