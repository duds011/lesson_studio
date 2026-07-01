import { NextRequest, NextResponse } from 'next/server'
import { generateRecap } from '@/lib/openai'
import { getStudent, saveLesson, nextLessonNumber, type Lesson } from '@/lib/students'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Import a raw transcript → build recap (gpt-4.1) → save as a lesson for a student.
export async function POST(req: NextRequest) {
  try {
    const { studentId, date, title, transcript } = await req.json()
    if (!studentId || !transcript) {
      return NextResponse.json({ ok: false, error: 'Missing studentId or transcript.' }, { status: 400 })
    }
    const student = await getStudent(studentId)
    if (!student) return NextResponse.json({ ok: false, error: 'Student not found.' }, { status: 404 })

    const recap = await generateRecap({ studentName: student.name, transcript })

    const lessonNumber = await nextLessonNumber(studentId)
    const lesson: Lesson = {
      id: `${studentId}-L${lessonNumber}-${Date.now()}`,
      studentId,
      lessonNumber,
      date: date || new Date().toISOString().slice(0, 10),
      title: title || `Lesson ${lessonNumber}`,
      recap,
      studentTalkPct: typeof recap.talk_percentage === 'number' ? recap.talk_percentage : null,
      status: 'draft',
      createdAt: Date.now(),
    }
    await saveLesson(lesson)

    return NextResponse.json({
      ok: true,
      lessonId: lesson.id,
      lessonNumber,
      sections: recap.sections?.length ?? 0,
      vocab: recap.vocabulary?.length ?? 0,
      homework: recap.homework?.length ?? 0,
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'failed' }, { status: 500 })
  }
}
