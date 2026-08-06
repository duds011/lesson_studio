import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTest, type TestScript } from '@/lib/openai'
import { lessonDisplayTitle } from '@/lib/portal-utils'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // GPT needs a while for a full-length test

// Auth is done in-route (this path is not covered by the middleware matcher):
// the caller must be a logged-in teacher, and all DB access goes through their
// own Supabase client so RLS enforces ownership.
async function requireTeacher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return { supabase, user: profile?.role === 'teacher' ? user : null }
}

// Flatten a lesson recap into plain text the test prompt can work from.
function recapToContent(recap: any): string {
  const chunks: string[] = []
  if (recap?.recap) chunks.push(`Overview: ${recap.recap}`)
  for (const s of recap?.sections ?? []) chunks.push(`Section — ${s.title}\n${s.content}`)
  const vocab = (recap?.vocabulary ?? [])
    .map((v: any) => `${v.word} (${v.reading}) — ${v.definition}`)
    .join('\n')
  if (vocab) chunks.push(`Vocabulary:\n${vocab}`)
  return chunks.join('\n\n')
}

// Generate a draft test from a lesson.
export async function POST(req: NextRequest) {
  const { studentId, lessonId, script: rawScript } = await req.json()
  if (!studentId || !lessonId) return NextResponse.json({ ok: false, error: 'Missing studentId or lessonId' }, { status: 400 })
  const script: TestScript = ['beginner', 'hiragana', 'kanji'].includes(rawScript) ? rawScript : 'hiragana'

  const { supabase, user } = await requireTeacher()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const [{ data: student }, { data: lesson }, { data: teacherProfile }] = await Promise.all([
    supabase.from('students').select('id, full_name, teacher_id').eq('id', studentId).single(),
    supabase.from('lessons').select('id, title, lesson_number, student_id, lesson_summaries ( recap_json )').eq('id', lessonId).single(),
    supabase.from('profiles').select('teaching_language').eq('id', user.id).single(),
  ])
  if (!student || !lesson || (lesson as any).student_id !== student.id) {
    return NextResponse.json({ ok: false, error: 'Lesson or student not found' }, { status: 404 })
  }

  const l = lesson as any
  const summary = Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries
  const recap = summary?.recap_json
  if (!recap) return NextResponse.json({ ok: false, error: 'This lesson has no recap to base a test on' }, { status: 400 })

  const lessonTitle = lessonDisplayTitle(recap, l.title, l.lesson_number)
  const language = (teacherProfile as any)?.teaching_language || 'Japanese'
  const isJapanese = /japanese/i.test(language)

  try {
    const testJson = await generateTest({
      studentName: student.full_name,
      lessonTitle,
      lessonContent: recapToContent(recap),
      script,
      language,
    })
    if (!Array.isArray(testJson?.parts) || testJson.parts.length === 0) {
      throw new Error('Model returned no test parts')
    }
    // The script choice is a Japanese writing-system concern only.
    if (isJapanese) testJson.script = script

    const { data: row, error } = await supabase
      .from('tests')
      .insert({
        teacher_id: user.id,
        student_id: student.id,
        lesson_id: l.id,
        title: testJson.title || `Practice Test — ${lessonTitle}`,
        level: testJson.level || (isJapanese ? 'N5' : 'A2'),
        status: 'draft',
        test_json: testJson,
      })
      .select('id')
      .single()
    if (error) throw error

    return NextResponse.json({ ok: true, testId: row.id })
  } catch (e: any) {
    console.error('test generation failed', e?.message || e)
    return NextResponse.json({ ok: false, error: e?.message || 'Test generation failed' }, { status: 500 })
  }
}

// Publish / unpublish a test.
export async function PATCH(req: NextRequest) {
  const { testId, action } = await req.json()
  if (!testId || !['publish', 'unpublish'].includes(action)) {
    return NextResponse.json({ ok: false, error: 'Missing testId or invalid action' }, { status: 400 })
  }

  const { supabase, user } = await requireTeacher()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('tests')
    .update(action === 'publish'
      ? { status: 'published', published_at: new Date().toISOString() }
      : { status: 'draft', published_at: null })
    .eq('id', testId)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Delete a test the teacher doesn't want to keep.
export async function DELETE(req: NextRequest) {
  const { testId } = await req.json()
  if (!testId) return NextResponse.json({ ok: false, error: 'Missing testId' }, { status: 400 })

  const { supabase, user } = await requireTeacher()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('tests').delete().eq('id', testId)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
