import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCreditsByStudent } from '@/lib/credits'
import AddStudentForm from '@/components/portal/AddStudentForm'
import StudentAdminActions from '@/components/portal/StudentAdminActions'
import PageHeader from '@/components/PageHeader'
import StudentsTabs from '@/components/portal/StudentsTabs'
import ClassAnalytics, { type StudentAnalytics } from '@/components/portal/ClassAnalytics'

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
    .select('id, student_id, lesson_number, lesson_date, lesson_summaries ( score, talk_percentage, vocab_total_count )')
    .eq('teacher_id', user.id)
    // Oldest first, so "first score" and "last score" mean what they say.
    .order('lesson_number', { ascending: true })

  const statsByStudent = new Map<string, {
    count: number; scores: number[]; talks: number[]; vocab: number; lastDate: string | null
  }>()
  for (const l of (lessons || []) as any[]) {
    const s = statsByStudent.get(l.student_id)
      ?? { count: 0, scores: [], talks: [], vocab: 0, lastDate: null }
    s.count += 1
    const sum = Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries
    if (sum?.score != null) s.scores.push(Number(sum.score))
    if (sum?.talk_percentage != null) s.talks.push(Number(sum.talk_percentage))
    s.vocab += sum?.vocab_total_count ?? 0
    if (l.lesson_date && (!s.lastDate || l.lesson_date > s.lastDate)) s.lastDate = l.lesson_date
    statsByStudent.set(l.student_id, s)
  }

  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
  const daysSince = (d: string | null) =>
    d ? Math.floor((Date.now() - new Date(`${d}T12:00:00`).getTime()) / 86_400_000) : null

  const { data: profile } = await supabase.from('profiles').select('currency, teaching_language, speaking_language').eq('id', user.id).single()
  const currency = (profile as any)?.currency ?? 'USD'
  const teachingLanguage = (profile as any)?.teaching_language ?? ''
  // Pre-fills the new-student "explain lessons in" field: the language the
  // teacher said they explain in is usually every student's.
  const speakingLanguage = (profile as any)?.speaking_language ?? ''

  const creditMap = await getCreditsByStudent(supabase, user.id)

  const rows = (students || []) as any[]
  const totalLessons = (lessons || []).length
  const lowStudents = rows.filter((r) => (creditMap.get(r.id) ?? { low: false }).low)

  const analyticsRows: StudentAnalytics[] = rows.map((s) => {
    const st = statsByStudent.get(s.id)
    return {
      id: s.id,
      // First name only: full names do not fit a chart axis, and a teacher
      // knows their own students by them.
      name: String(s.full_name).split(' ')[0],
      lessons: st?.count ?? 0,
      avgScore: mean(st?.scores ?? []),
      firstScore: st?.scores[0] ?? null,
      lastScore: st?.scores.length ? st.scores[st.scores.length - 1] : null,
      avgTalk: mean(st?.talks ?? []),
      vocab: st?.vocab ?? 0,
      daysSinceLast: daysSince(st?.lastDate ?? null),
    }
  })

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <PageHeader
        eyebrow="Teacher"
        title="Your students"
        figures={[
          { label: 'Students', value: rows.length },
          { label: 'With login', value: rows.filter((r) => r.profile_id).length },
          { label: 'Lessons recorded', value: totalLessons },
        ]}
        actions={<AddStudentForm currency={currency} teachingLanguage={teachingLanguage} speakingLanguage={speakingLanguage} />}
      />

      {lowStudents.length > 0 && (
        <div className="warn-box" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <strong>⚠️ Running low on lessons:</strong>
          {lowStudents.map((s) => {
            const c = creditMap.get(s.id)!
            return (
              <Link key={s.id} href={`/teacher/students/${s.id}`} className="pill" style={{ background: c.remaining <= 0 ? 'var(--red-soft)' : '#fff', color: c.remaining <= 0 ? 'var(--red)' : 'var(--amber)', border: '1px solid #ead7a5' }}>
                {s.full_name.split(' ')[0]} · {c.remaining <= 0 ? 'out' : `${c.remaining} left`}
              </Link>
            )
          })}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="empty">
          <strong style={{ color: 'var(--ink)' }}>No students yet</strong>
          <br />
          Use “Add student” to create the first account.
        </div>
      ) : (
        <StudentsTabs
          studentCount={rows.length}
          analytics={<ClassAnalytics rows={analyticsRows} />}
          list={
        <div className="student-grid">
          {rows.map((s) => {
            const st = statsByStudent.get(s.id) ?? { count: 0, scores: [] as number[], talks: [] as number[], vocab: 0, lastDate: null }
            const avg = st.scores.length ? (st.scores.reduce((a, b) => a + b, 0) / st.scores.length).toFixed(1) : '—'
            const c = creditMap.get(s.id) ?? { purchased: 0, used: 0, remaining: 0, low: false }
            return (
              <div key={s.id} className="student-card sc-cols">
                <Link href={`/teacher/students/${s.id}`} className="student-identity" style={{ color: 'inherit' }} title="View progress & recaps">
                  <div className="avatar">{s.full_name.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}</div>
                  <div>
                    <div className="sc-name">{s.full_name}</div>
                    {/* Keyed on the login, not the address: a student who
                        joined always has one, whether or not the email made it
                        back onto this row. */}
                    <div className="sc-email">{s.profile_id ? (s.email || '—') : 'Invited — not joined yet'}</div>
                  </div>
                </Link>
                <div>
                  <div className="analytics-label">Lessons</div>
                  <strong>{st.count}</strong>
                </div>
                <div>
                  <div className="analytics-label">Avg</div>
                  <strong style={{ color: 'var(--brand)' }}>{avg}</strong>
                </div>
                <div>
                  <div className="analytics-label">Left</div>
                  <strong style={{ color: c.remaining <= 0 ? 'var(--red)' : c.low ? 'var(--amber)' : 'var(--ink)' }}>
                    {c.purchased > 0 || c.used > 0 ? c.remaining : '—'}{c.low && (c.purchased > 0 || c.used > 0) ? ' ⚠️' : ''}
                  </strong>
                </div>
                <StudentAdminActions studentId={s.id} hasLogin={!!s.profile_id} />
              </div>
            )
          })}
        </div>
          }
        />
      )}

      <p style={{ fontSize: 11, color: 'var(--muted)' }}>
        Your calendar, recordings, and recap tools are under{' '}
        <Link href="/" style={{ color: 'var(--brand)', fontWeight: 700 }}>Overview</Link> in the sidebar.
      </p>
    </div>
  )
}
