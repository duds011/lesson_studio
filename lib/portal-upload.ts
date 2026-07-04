'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * Uploads a file straight to Supabase Storage via a server-authorized signed
 * URL, then records the metadata row. Used for teacher files & student audio.
 */
export async function uploadPortalFile(
  kind: 'teacher-file' | 'student-audio',
  lessonId: string,
  file: File | Blob,
  fileName: string,
  note?: string,
) {
  const initRes = await fetch('/api/portal/upload-init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, lessonId, fileName }),
  })
  if (!initRes.ok) throw new Error((await initRes.json()).error || 'Could not start upload')
  const { bucket, path, token } = await initRes.json()

  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file, {
    contentType: (file as File).type || 'application/octet-stream',
  })
  if (error) throw new Error(error.message)

  const completeRes = await fetch('/api/portal/upload-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, lessonId, path, fileName, contentType: (file as File).type, size: (file as any).size, note }),
  })
  if (!completeRes.ok) throw new Error((await completeRes.json()).error || 'Could not save upload')
}
