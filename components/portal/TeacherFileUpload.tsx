'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadPortalFile } from '@/lib/portal-upload'

export default function TeacherFileUpload({ lessonId }: { lessonId: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      await uploadPortalFile('teacher-file', lessonId, file, file.name)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,.key,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.mp3,.m4a,.wav,.zip"
        style={{ display: 'none' }}
        onChange={onPick}
      />
      <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? 'Uploading…' : '+ Upload file'}
      </button>
      {error && <span style={{ fontSize: 11, color: 'var(--red)', marginLeft: 10 }}>{error}</span>}
    </div>
  )
}
