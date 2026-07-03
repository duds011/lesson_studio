import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudent, getStudents, getLessonsByStudent, progressStats } from '@/lib/students'
import { PublicNav } from '@/components/AppNav'

export async function generateStaticParams() {
  return (await getStudents()).map((s) => ({ id: s.id }))
}

export default async function StudentDashboard({ params }: { params: { id: string } }) {
  const student = await getStudent(params.id)
  if (!student) notFound()
  const lessons = await getLessonsByStudent(params.id)
  const stats = progressStats(lessons)

  return (
    <>
      <PublicNav backHref="/students" backLabel="All students" />

      <main className="main-wrap page-fade">
        <div className="profile-layout">
          <aside className="profile-rail surface">
            <div className="profile-head">
              <div className="avatar lg">{student.name.charAt(0).toUpperCase()}</div>
              <div><h1>{student.name}</h1><p className="lead">Student profile</p></div>
            </div>
            <div className="profile-meta">
              <div><span>Language</span><strong>{student.language}</strong></div>
              <div><span>Level</span><strong>{student.level}</strong></div>
              <div><span>Email</span><strong>{student.email}</strong></div>
            </div>
          </aside>

          <section className="profile-main">
            <div className="profile-intro"><span className="eyebrow">Learning overview</span><h1>Progress at a glance</h1><p className="sub">A clear view of {student.name.split(' ')[0]}’s recent activity and lesson history.</p></div>
            <div className="analytics-grid">
              <div className="analytics-card"><div className="analytics-label">Lessons</div><div className="analytics-value">{stats.lessonCount}</div></div>
              <div className="analytics-card"><div className="analytics-label">Average score</div><div className="analytics-value">{stats.avgScore ?? '—'}</div></div>
              <div className="analytics-card"><div className="analytics-label">Words practiced</div><div className="analytics-value">{stats.totalVocab}</div></div>
              <div className="analytics-card"><div className="analytics-label">Confidence</div><div className="analytics-value" style={{ fontSize: '1rem', paddingTop: '.5rem' }}>{lessons[lessons.length - 1]?.recap?.confidence_label ?? '—'}</div></div>
            </div>

            <h2 className="section-heading">Lesson history</h2>
            {lessons.length === 0 ? <div className="empty">No lessons have been published for this student yet.</div> : lessons.slice().reverse().map((l) => (
              <Link key={l.id} href={`/students/${student.id}/lessons/${l.id}`} className="lesson-card">
                <div className="lc-num">L{l.lessonNumber}</div>
                <div><div className="lc-title">{l.title}</div><div className="lc-meta">{l.date} · {l.recap?.sections?.length ?? 0} topics · {l.recap?.vocabulary?.length ?? 0} words · {l.recap?.confidence_label}</div></div>
                <div className="lc-score" aria-label={`Score ${l.recap?.score ?? 'not available'}`}>{l.recap?.score ?? '—'}</div>
                <div className="lc-arrow">→</div>
              </Link>
            ))}
          </section>
        </div>
      </main>
      <footer>Lesson Studio · Student learning portal</footer>
    </>
  )
}
