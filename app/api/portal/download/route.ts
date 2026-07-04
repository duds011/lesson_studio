import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Returns a short-lived signed download URL. The row is read with the caller's
 * own client, so RLS decides whether they may see it; only then do we sign.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const kind = searchParams.get('kind')
  const id = searchParams.get('id')
  if (!kind || !id) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const table = kind === 'file' ? 'lesson_attachments' : kind === 'audio' ? 'student_audio_submissions' : null
  if (!table) return NextResponse.json({ error: 'Bad kind' }, { status: 400 })

  // RLS on these tables ensures the caller can only read rows they're allowed to.
  const { data: row } = await supabase.from(table).select('bucket, path, file_name').eq('id', id).single()
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const admin = createAdminClient()
  const { data: signed, error } = await admin.storage.from(row.bucket).createSignedUrl(row.path, 120, {
    download: row.file_name ?? undefined,
  })
  if (error || !signed) return NextResponse.json({ error: error?.message ?? 'Sign failed' }, { status: 500 })

  return NextResponse.redirect(signed.signedUrl)
}
