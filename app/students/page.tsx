import Link from 'next/link'
import { getStudents, getLessons } from '@/lib/students'
import AppNav from '@/components/AppNav'
import { getToken } from '@/lib/store'

export const dynamic = 'force-dynamic'

function initial(name: string) { return name.trim().charAt(0).toUpperCase() }

export default async function StudentsPage() {
  const students = await getStudents()
  const lessons = await getLessons()
  const token = await getToken()
  const countByStudent: Record<string, number> = {}
  for (const l of Object.values(lessons)) countByStudent[l.studentId] = (countByStudent[l.studentId] ?? 0) + 1

  return (
    <>
      <AppNav email={token?.email} connected={Boolean(token)} />
      <main className="wrap page-fade">
        <div className="page-head">
          <div>
            <span className="eyebrow">Students</span>
            <h2 className="title">Your students</h2>
            <p className="sub">{students.length} students · open a profile for progress, lessons, homework and vocabulary.</p>
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
                {countByStudent[s.id] ? <span className="sc-badge">{countByStudent[s.id]} lesson{countByStudent[s.id] > 1 ? 's' : ''}</span> : null}
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
