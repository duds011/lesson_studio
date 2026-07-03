import Link from 'next/link'
import { getStudents, getLessons } from '@/lib/students'
import AppNav from '@/components/AppNav'
import { getToken } from '@/lib/store'

export const dynamic = 'force-dynamic'

function initial(name: string) { return name.trim().charAt(0).toUpperCase() }

function ArrowIcon() {
  return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m9 18 6-6-6-6" /></svg>
}

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
            <span className="eyebrow">People</span>
            <h2 className="title">Students</h2>
            <p className="sub">A single place for every learner’s progress, lesson history, homework, and vocabulary.</p>
          </div>
        </div>

        {students.length === 0 ? <div className="empty"><strong>No students yet.</strong><br />Students will appear here after their lesson data is imported.</div> : <div className="directory">
          <div className="directory-head" aria-hidden="true">
            <span>Student</span><span>Course</span><span>Lessons</span><span>Contact</span><span />
          </div>
          {students.map((s) => (
            <Link key={s.id} href={`/students/${s.id}`} className="student-card">
              <div className="student-identity">
                <div className="avatar">{initial(s.name)}</div>
                <div>
                  <div className="sc-name">{s.name}</div>
                  <div className="sc-email">View learning profile</div>
                </div>
              </div>
              <div><span className="lang-pill">{s.language}</span> <span className="sc-level">{s.level}</span></div>
              <strong>{countByStudent[s.id] ?? 0}</strong>
              <span className="sc-email">{s.email}</span>
              <ArrowIcon />
            </Link>
          ))}
        </div>}
      </main>
    </>
  )
}
