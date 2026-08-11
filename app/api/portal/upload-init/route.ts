import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Authorizes an upload and returns a signed upload URL so the browser can send
 * the file straight to Supabase Storage (bypassing serverless body limits).
 * kind='teacher-file'  → teacher attaches a file to a lesson
 * kind='student-audio' → student submits an audio recording for a lesson
 * kind='test-audio'    → student answers a test's speaking prompt out loud
 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { kind, lessonId, testId, fileName } = await req.json()
  if (!kind || !fileName || (!lessonId && !testId)) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin = createAdminClient()

  // Test speaking answers: the student on the test is the one uploading, and
  // only a published test accepts audio — a draft is still the teacher's.
  if (kind === 'test-audio') {
    const { data: test } = await admin.from('tests').select('id, student_id, status').eq('id', testId).single()
    if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    if (test.status !== 'published') return NextResponse.json({ error: 'Test is not published' }, { status: 403 })
    const { data: student } = await admin.from('students').select('id').eq('id', test.student_id).eq('profile_id', user.id).single()
    if (!student) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const safe = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)
    const path = `tests/${testId}/${crypto.randomUUID()}-${safe}`
    const { data, error } = await admin.storage.from('student-audio').createSignedUploadUrl(path)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bucket: 'student-audio', path, token: data.token })
  }

  const { data: lesson } = await admin.from('lessons').select('id, student_id, teacher_id').eq('id', lessonId).single()
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  let bucket: string
  if (kind === 'teacher-file') {
    if (lesson.teacher_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    bucket = 'lesson-files'
  } else if (kind === 'student-audio') {
    const { data: student } = await admin.from('students').select('id').eq('id', lesson.student_id).eq('profile_id', user.id).single()
    if (!student) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    bucket = 'student-audio'
  } else {
    return NextResponse.json({ error: 'Bad kind' }, { status: 400 })
  }

  const safe = String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)
  const path = `${lessonId}/${crypto.randomUUID()}-${safe}`
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ bucket, path, token: data.token })
}
