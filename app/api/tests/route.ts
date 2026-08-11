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
  const { studentId, lessonId, lessonIds: rawIds, script: rawScript } = await req.json()
  // One test can now span several lessons; the single-lesson field stays
  // accepted so nothing that still sends it breaks.
  const lessonIds: string[] = Array.isArray(rawIds) && rawIds.length
    ? rawIds.map(String).slice(0, 10)
    : lessonId ? [String(lessonId)] : []
  if (!studentId || lessonIds.length === 0) return NextResponse.json({ ok: false, error: 'Missing studentId or lessons' }, { status: 400 })
  const script: TestScript = ['beginner', 'hiragana', 'kanji'].includes(rawScript) ? rawScript : 'hiragana'

  const { supabase, user } = await requireTeacher()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const [{ data: student }, { data: lessonRows }, { data: teacherProfile }] = await Promise.all([
    supabase.from('students').select('id, full_name, teacher_id, language').eq('id', studentId).single(),
    supabase.from('lessons').select('id, title, lesson_number, student_id, lesson_summaries ( recap_json )').in('id', lessonIds),
    supabase.from('profiles').select('teaching_language').eq('id', user.id).single(),
  ])
  const lessons = ((lessonRows ?? []) as any[])
    .filter((l) => l.student_id === (student as any)?.id)
    .sort((a, b) => (a.lesson_number ?? 0) - (b.lesson_number ?? 0))
  if (!student || lessons.length === 0) {
    return NextResponse.json({ ok: false, error: 'Lesson or student not found' }, { status: 404 })
  }

  const withRecaps = lessons
    .map((l) => {
      const summary = Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries
      return { l, recap: summary?.recap_json }
    })
    .filter((x) => x.recap)
  if (withRecaps.length === 0) return NextResponse.json({ ok: false, error: 'These lessons have no recaps to base a test on' }, { status: 400 })

  const l = withRecaps[0].l
  const recap = withRecaps[0].recap
  // One lesson keeps its own title; a span reads as the review it is.
  const numbers = withRecaps.map((x) => x.l.lesson_number).filter(Boolean)
  const lessonTitle = withRecaps.length === 1
    ? lessonDisplayTitle(recap, l.title, l.lesson_number)
    : numbers.length
      ? `Lessons ${Math.min(...numbers)}–${Math.max(...numbers)} review`
      : 'Multi-lesson review'
  // Each lesson's material labelled with its number, so the model can spread
  // coverage across all of them rather than blending everything together.
  const combinedContent = withRecaps
    .map((x) => `=== LESSON ${x.l.lesson_number}: ${lessonDisplayTitle(x.recap, x.l.title, x.l.lesson_number)} ===\n${recapToContent(x.recap)}`)
    .join('\n\n')
  // The test is for this student, so their language decides its kind — a
  // teacher can have students in different languages. Falling back to
  // 'Japanese' here is what put hiragana options in front of French teachers:
  // any teacher whose profile predates the language field hit the fallback.
  const language = (student as any).language || (teacherProfile as any)?.teaching_language || 'English'
  const isJapanese = /japanese|日本語/i.test(language)

  try {
    const testJson = await generateTest({
      studentName: student.full_name,
      lessonTitle,
      lessonContent: combinedContent,
      script,
      language,
      lessonCount: withRecaps.length,
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
