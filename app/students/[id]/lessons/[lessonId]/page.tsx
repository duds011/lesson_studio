import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudent, getStudents, getLessons, getLessonsByStudent } from '@/lib/students'
import KanaBackground from '@/components/KanaBackground'
import LessonPageTabs from '@/components/LessonPageTabs'

// Pre-render every lesson page at build time (static → Netlify).
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
      <KanaBackground />
      <nav>
        <div className="nav-in">
          <a className="logo" href={`/students/${student.id}`}><span className="mark">の</span><span><span className="brand-word">GENOA</span> Library</span></a>
          <div className="nav-right">
            <Link className="btn btn-ghost btn-sm" href={`/students/${student.id}`}>← {student.name}</Link>
          </div>
        </div>
      </nav>

      <main className="main-wrap">
        <section className="summary-panel">
          <div className="eyebrow"><span className="dot" />Lesson Recap</div>
          <h1>{lesson.title}</h1>
          <p className="lead">🇯🇵 Japanese Lesson Recap · {student.name} &amp; Noa</p>

          <div className="lesson-meta">
            <div className="meta-box"><div className="meta-label">Student</div><div className="meta-value">{student.name}</div></div>
            <div className="meta-box"><div className="meta-label">Lesson</div><div className="meta-value">Lesson {lesson.lessonNumber}</div></div>
            <div className="meta-box"><div className="meta-label">Date</div><div className="meta-value">{fmtDate}</div></div>
            <div className="meta-box"><div className="meta-label">Score</div><div className="meta-value">{lesson.recap.score} / 10</div></div>
          </div>

          <LessonPageTabs lesson={lesson as any} studentFirst={student.name.split(' ')[0]} />
        </section>
      </main>
      <footer>{student.name} • Lesson {lesson.lessonNumber} recap</footer>
    </>
  )
}
