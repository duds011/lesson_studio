import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { generateRecap } from '@/lib/openai'
import { getStudent, saveLesson, nextLessonNumber, getLessonsByStudent, type Lesson } from '@/lib/students'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

// One-shot: build recaps for the seeded transcript files. Idempotent-ish:
// skips a student who already has a lesson dated the same day.
const JOBS = [
  { studentId: 'jeff-ganly', file: 'jeff-ganly.txt', date: '2026-06-27' },
  { studentId: 'jorge-de-los-rios', file: 'jorge-delosrios.txt', date: '2026-06-27' },
  { studentId: 'james-coker', file: 'james-coker.txt', date: '2026-06-27' },
]

export async function GET() {
  const dir = path.join(process.cwd(), '.data', 'transcripts')
  const results: any[] = []

  for (const job of JOBS) {
    try {
      const student = await getStudent(job.studentId)
      if (!student) { results.push({ ...job, skipped: 'no student' }); continue }

      const existing = await getLessonsByStudent(job.studentId)
      if (existing.some((l) => l.date === job.date)) {
        results.push({ ...job, skipped: 'already has lesson on this date' }); continue
      }

      const transcript = await fs.readFile(path.join(dir, job.file), 'utf-8')
      const recap = await generateRecap({ studentName: student.name, transcript })
      const lessonNumber = await nextLessonNumber(job.studentId)
      const lesson: Lesson = {
        id: `${job.studentId}-L${lessonNumber}-${Date.now()}`,
        studentId: job.studentId,
        lessonNumber,
        date: job.date,
        title: recap.recap?.split('\n')[0]?.replace(/^Lesson Recap\s*[—-]\s*/i, '').slice(0, 80) || `Lesson ${lessonNumber}`,
        recap,
        studentTalkPct: typeof recap.talk_percentage === 'number' ? recap.talk_percentage : null,
        status: 'draft',
        createdAt: Date.now(),
      }
      await saveLesson(lesson)
      results.push({ student: student.name, lessonNumber, sections: recap.sections?.length, vocab: recap.vocabulary?.length, homework: recap.homework?.length })
    } catch (e: any) {
      results.push({ ...job, error: e?.message ?? 'failed' })
    }
  }

  return NextResponse.json({ ok: true, results })
}
