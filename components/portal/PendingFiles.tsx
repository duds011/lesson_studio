'use client'

import { useRef, useState } from 'react'

/**
 * Files chosen while reviewing a draft.
 *
 * They cannot be uploaded yet: an attachment belongs to a lesson row, and that
 * row does not exist until the recap is approved. So the files are held here
 * and sent the moment publishing creates the lesson — the same trick the voice
 * memo uses. Without this the teacher had to publish, navigate to the lesson,
 * and upload as a second errand.
 */
export default function PendingFiles({ onChange, studentFirst = 'the student', initial }: {
  onChange: (files: File[]) => void
  studentFirst?: string
  /**
   * What the parent is already holding.
   *
   * Switching tabs unmounts this, and remounting used to start from an empty
   * list while the parent's ref still had the files — so they were shown as
   * gone and then attached anyway. Seeding from the parent makes what is on
   * screen the truth again.
   */
  initial?: File[]
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>(initial ?? [])

  const update = (next: File[]) => {
    setFiles(next)
    onChange(next)
  }

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? [])
    if (chosen.length) update([...files, ...chosen])
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.ppt,.pptx,.key,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.mp3,.m4a,.wav,.zip"
        style={{ display: 'none' }}
        onChange={pick}
      />
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => inputRef.current?.click()}>
        + Attach a file
      </button>

      {files.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface-2)' }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                📄 {f.name}
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{(f.size / 1024 / 1024).toFixed(1)}MB</span>
              <button type="button" className="btn btn-danger-ghost btn-sm" onClick={() => update(files.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
          <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0 }}>
            Sent to {studentFirst} when you approve the recap.
          </p>
        </div>
      )}
    </div>
  )
}
