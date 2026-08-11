import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/** Records the metadata row after a successful signed upload. */
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { kind, lessonId, testId, path, fileName, contentType, size, note, promptIndex } = await req.json()
  if (!kind || !path || (!lessonId && !testId)) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin = createAdminClient()

  if (kind === 'test-audio') {
    const { data: test } = await admin.from('tests').select('id, student_id, status').eq('id', testId).single()
    if (!test || test.status !== 'published') return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    const { data: student } = await admin.from('students').select('id').eq('id', test.student_id).eq('profile_id', user.id).single()
    if (!student) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // One recording per prompt: a re-record replaces, so the teacher hears the
    // student's best take rather than an accidental pile of false starts.
    if (typeof promptIndex === 'number') {
      await admin.from('student_audio_submissions').delete().eq('test_id', testId).eq('prompt_index', promptIndex)
    }
    const { error } = await admin.from('student_audio_submissions').insert({
      test_id: testId, lesson_id: null, student_id: student.id, prompt_index: promptIndex ?? null,
      bucket: 'student-audio', path, file_name: fileName ?? null, content_type: contentType ?? null, size_bytes: size ?? null, note: note ?? null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  const { data: lesson } = await admin.from('lessons').select('id, student_id, teacher_id').eq('id', lessonId).single()
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  if (kind === 'teacher-file') {
    if (lesson.teacher_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { error } = await admin.from('lesson_attachments').insert({
      lesson_id: lessonId, student_id: lesson.student_id, uploaded_by: user.id,
      bucket: 'lesson-files', path, file_name: fileName, content_type: contentType ?? null, size_bytes: size ?? null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else if (kind === 'student-audio') {
    const { data: student } = await admin.from('students').select('id').eq('id', lesson.student_id).eq('profile_id', user.id).single()
    if (!student) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const { error } = await admin.from('student_audio_submissions').insert({
      lesson_id: lessonId, student_id: student.id,
      bucket: 'student-audio', path, file_name: fileName ?? null, content_type: contentType ?? null, size_bytes: size ?? null, note: note ?? null,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    return NextResponse.json({ error: 'Bad kind' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
