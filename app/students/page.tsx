import Link from 'next/link'
import { getStudents, getLessons } from '@/lib/students'
import KanaBackground from '@/components/KanaBackground'

function initial(name: string) { return name.trim().charAt(0).toUpperCase() }

export default async function StudentsPage() {
  const students = await getStudents()
  const lessons = await getLessons()
  const countByStudent: Record<string, number> = {}
  for (const l of Object.values(lessons)) countByStudent[l.studentId] = (countByStudent[l.studentId] ?? 0) + 1

  return (
    <>
      <KanaBackground />
      <nav>
        <div className="nav-in">
          <a className="logo" href="/"><span className="mark">の</span><span><span className="brand-word">GENOA</span> Library</span></a>
          <div className="nav-right">
            <a className="btn btn-ghost btn-sm" href="/">Calendar</a>
            <a className="btn btn-ghost btn-sm" href="/book">Booking</a>
          </div>
        </div>
      </nav>

      <main className="wrap">
        <div className="page-head">
          <div>
            <span className="eyebrow"><span className="dot" style={{ width: '.4rem', height: '.4rem', background: 'var(--brand)' }} />Roster</span>
            <h2 className="title">👥 Your Students</h2>
            <p className="sub">{students.length} students · click a card to view progress, lessons, homework & vocabulary.</p>
          </div>
        </div>

        <div className="student-grid">
          {students.map((s) => (
            <Link key={s.id} href={`/students/${s.id}`} className="student-card">
              <div className="sc-head">
                <div className="avatar">{initial(s.name)}</div>
                <div>
                  <div className="sc-name">{s.name}</div>
                  <div className="sc-level">{s.level}</div>
                </div>
                {countByStudent[s.id] ? <span className="sc-badge">{countByStudent[s.id]} ●</span> : null}
              </div>
              <div className="sc-foot">
                <span className="lang-pill">{s.language}</span>
                <span className="sc-email">{s.email}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
