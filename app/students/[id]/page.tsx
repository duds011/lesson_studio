import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudent, getStudents, getLessonsByStudent, progressStats } from '@/lib/students'
import KanaBackground from '@/components/KanaBackground'

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
      <KanaBackground />
      <nav>
        <div className="nav-in">
          <a className="logo" href="/students"><span className="mark">の</span><span><span className="brand-word">GENOA</span> Library</span></a>
          <div className="nav-right">
            <Link className="btn btn-ghost btn-sm" href="/students">← All students</Link>
          </div>
        </div>
      </nav>

      <main className="main-wrap">
        <section className="summary-panel">
          <div className="profile-head">
            <div className="avatar lg">{student.name.charAt(0).toUpperCase()}</div>
            <div>
              <h1 style={{ margin: 0 }}>{student.name}</h1>
              <p className="lead">{student.level} · {student.language}</p>
            </div>
          </div>

          <div className="analytics-grid" style={{ marginTop: '1.4rem' }}>
            <div className="analytics-card"><div className="analytics-label">Lessons</div><div className="analytics-value">{stats.lessonCount}</div></div>
            <div className="analytics-card"><div className="analytics-label">Avg score</div><div className="analytics-value">{stats.avgScore ?? '—'}</div></div>
            <div className="analytics-card"><div className="analytics-label">Vocab learned</div><div className="analytics-value">{stats.totalVocab}</div></div>
            <div className="analytics-card"><div className="analytics-label">Latest confidence</div><div className="analytics-value" style={{ fontSize: '1.1rem', paddingTop: '.4rem' }}>{lessons[lessons.length - 1]?.recap?.confidence_label ?? '—'}</div></div>
          </div>

          <h2 className="section-heading">📚 Lessons</h2>
          {lessons.length === 0 ? (
            <div className="empty">No lessons yet for {student.name}.</div>
          ) : (
            lessons.slice().reverse().map((l) => (
              <Link key={l.id} href={`/students/${student.id}/lessons/${l.id}`} className="lesson-card">
                <div className="lc-num">L{l.lessonNumber}</div>
                <div className="lc-body">
                  <div className="lc-title">{l.title}</div>
                  <div className="lc-meta">{l.date} · {l.recap?.sections?.length ?? 0} sections · {l.recap?.vocabulary?.length ?? 0} vocab · {l.recap?.confidence_label}</div>
                </div>
                <div className="lc-score">{l.recap?.score ?? '—'}</div>
                <div className="lc-arrow">→</div>
              </Link>
            ))
          )}
        </section>
      </main>
      <footer>{student.name} • GENOA Library</footer>
    </>
  )
}
