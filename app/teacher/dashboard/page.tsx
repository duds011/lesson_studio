import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AddStudentForm from '@/components/portal/AddStudentForm'
import StudentAdminActions from '@/components/portal/StudentAdminActions'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: students } = await supabase
    .from('students')
    .select('id, full_name, email, level, language, profile_id')
    .eq('teacher_id', user.id)
    .order('full_name')

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, student_id, lesson_summaries ( score, vocab_total_count )')
    .eq('teacher_id', user.id)

  const statsByStudent = new Map<string, { count: number; scores: number[]; vocab: number }>()
  for (const l of (lessons || []) as any[]) {
    const s = statsByStudent.get(l.student_id) ?? { count: 0, scores: [], vocab: 0 }
    s.count += 1
    const sum = Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries
    if (sum?.score != null) s.scores.push(sum.score)
    s.vocab += sum?.vocab_total_count ?? 0
    statsByStudent.set(l.student_id, s)
  }

  const rows = (students || []) as any[]
  const totalLessons = (lessons || []).length

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <span className="eyebrow">Teacher</span>
          <h1 className="title" style={{ margin: '6px 0 4px' }}>Your students</h1>
          <p className="sub">Create student accounts, manage logins, and track progress built from lesson recaps.</p>
        </div>
        <div className="page-actions"><AddStudentForm /></div>
      </div>

      <div className="dashboard-summary">
        <div className="summary-stat"><span>Students</span><strong>{rows.length}</strong></div>
        <div className="summary-stat"><span>With login</span><strong>{rows.filter((r) => r.profile_id).length}</strong></div>
        <div className="summary-stat"><span>Lessons recorded</span><strong>{totalLessons}</strong></div>
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <strong style={{ color: 'var(--ink)' }}>No students yet</strong>
          <br />
          Use “Add student” to create the first account.
        </div>
      ) : (
        <div className="student-grid">
          {rows.map((s) => {
            const st = statsByStudent.get(s.id) ?? { count: 0, scores: [], vocab: 0 }
            const avg = st.scores.length ? (st.scores.reduce((a, b) => a + b, 0) / st.scores.length).toFixed(1) : '—'
            return (
              <div key={s.id} className="student-card" style={{ gridTemplateColumns: 'minmax(180px,1.4fr) 90px 90px minmax(160px,1fr)' }}>
                <div className="student-identity">
                  <div className="avatar">{s.full_name.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}</div>
                  <div>
                    <div className="sc-name">{s.full_name}</div>
                    <div className="sc-email">{s.email}</div>
                  </div>
                </div>
                <div>
                  <div className="analytics-label">Lessons</div>
                  <strong>{st.count}</strong>
                </div>
                <div>
                  <div className="analytics-label">Avg score</div>
                  <strong style={{ color: 'var(--brand)' }}>{avg}</strong>
                </div>
                <StudentAdminActions studentId={s.id} hasLogin={!!s.profile_id} />
              </div>
            )
          })}
        </div>
      )}

      <p style={{ fontSize: 11, color: 'var(--muted)' }}>
        Your calendar, recordings, and recap tools are under{' '}
        <Link href="/" style={{ color: 'var(--brand)', fontWeight: 700 }}>Overview</Link> in the sidebar.
      </p>
    </div>
  )
}
