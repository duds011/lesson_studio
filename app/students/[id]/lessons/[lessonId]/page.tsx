import { notFound } from 'next/navigation'
import { getStudent, getLessons, getLessonsByStudent } from '@/lib/students'
import { PublicNav } from '@/components/AppNav'
import LessonPageTabs from '@/components/LessonPageTabs'

// Pre-render every lesson page at build time (static).
export async function generateStaticParams() {
  const lessons = await getLessons()
  return Object.values(lessons).map((l) => ({ id: l.studentId, lessonId: l.id }))
}

export default async function LessonPage({ params }: { params: { id: string; lessonId: string } }) {
  const student = await getStudent(params.id)
  const lessons = await getLessonsByStudent(params.id)
  const lesson = lessons.find((l) => l.id === params.lessonId)
  if (!student || !lesson) notFound()

  const fmtDate = new Date(`${lesson.date}T12:00:00+09:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <>
      <PublicNav backHref={`/students/${student.id}`} backLabel={student.name} />

      <main className="main-wrap page-fade">
        <section className="summary-panel">
          <div className="eyebrow">Lesson recap</div>
          <h1>{lesson.title}</h1>
          <p className="lead">{student.language} lesson · {student.name}</p>

          <div className="lesson-meta">
            <div className="meta-box"><div className="meta-label">Student</div><div className="meta-value">{student.name}</div></div>
            <div className="meta-box"><div className="meta-label">Lesson</div><div className="meta-value">Lesson {lesson.lessonNumber}</div></div>
            <div className="meta-box"><div className="meta-label">Date</div><div className="meta-value">{fmtDate}</div></div>
            <div className="meta-box"><div className="meta-label">Score</div><div className="meta-value">{lesson.recap.score} / 10</div></div>
          </div>

          <LessonPageTabs lesson={lesson as any} studentFirst={student.name.split(' ')[0]} />
        </section>
      </main>
      <footer>{student.name} · Lesson {lesson.lessonNumber} recap · Lesson Studio</footer>
    </>
  )
}
