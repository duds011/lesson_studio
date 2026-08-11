import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin'
import { formatDateShort } from '@/lib/portal-utils'
import AdminDeleteButton from '@/components/AdminDeleteButton'

export const dynamic = 'force-dynamic'

/**
 * The operator's view: every account on the service, and the delete button.
 *
 * Gated by ADMIN_EMAILS, and it 404s rather than 403s for everyone else — a
 * page that answers "forbidden" admits it exists.
 */
export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=%2Fadmin')
  if (!isAdminEmail(user.email)) notFound()

  const admin = createAdminClient()

  const [{ data: authUsers }, { data: profiles }, { data: students }, { data: lessons }] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 500 }).then((r: any) => ({ data: r.data?.users ?? [] })),
    admin.from('profiles').select('id, full_name, role, teaching_language, onboarding_completed_at, created_at'),
    admin.from('students').select('id, teacher_id, profile_id, full_name, email, language, created_at'),
    admin.from('lessons').select('id, teacher_id, student_id, status'),
  ])

  const authById = new Map((authUsers as any[]).map((u) => [u.id, u]))
  const lessonRows = (lessons ?? []) as any[]
  const lessonsByTeacher = new Map<string, number>()
  const lessonsByStudent = new Map<string, number>()
  for (const l of lessonRows) {
    lessonsByTeacher.set(l.teacher_id, (lessonsByTeacher.get(l.teacher_id) ?? 0) + 1)
    lessonsByStudent.set(l.student_id, (lessonsByStudent.get(l.student_id) ?? 0) + 1)
  }

  const teachers = ((profiles ?? []) as any[])
    .filter((p) => p.role === 'teacher')
    .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
  const studentRows = (students ?? []) as any[]

  // Auth users with no profile at all — signups that broke halfway. Shown so
  // they can be found and removed instead of accumulating invisibly.
  const orphanAuth = (authUsers as any[]).filter(
    (u) => !((profiles ?? []) as any[]).some((p) => p.id === u.id),
  )

  const fmt = (iso?: string | null) => (iso ? formatDateShort(iso) : '—')

  return (
    <main className="wrap page-fade" style={{ maxWidth: 980, padding: '32px 24px 80px' }}>
      <header style={{ marginBottom: 22 }}>
        <span className="eyebrow">Admin</span>
        <h1 style={{ marginTop: 6 }}>Accounts</h1>
        <p className="sub">
          {teachers.length} teacher{teachers.length === 1 ? '' : 's'} · {studentRows.length} student
          record{studentRows.length === 1 ? '' : 's'} · {lessonRows.length} lessons. Deleting a
          teacher removes everything under them, including their students&rsquo; sign-ins.
        </p>
      </header>

      {teachers.map((t) => {
        const au = authById.get(t.id)
        const kids = studentRows.filter((s) => s.teacher_id === t.id)
        return (
          <section key={t.id} className="k-sec" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0 }}>{t.full_name || '(no name)'} <span style={{ fontWeight: 500, color: 'var(--muted)', fontSize: 13 }}>· teacher</span></h3>
                <p className="desc" style={{ margin: '4px 0 0' }}>
                  {au?.email ?? 'no auth user'} · joined {fmt(t.created_at)} · last seen {fmt(au?.last_sign_in_at)}
                  {t.teaching_language ? ` · teaches ${t.teaching_language}` : ''}
                  {t.onboarding_completed_at ? '' : ' · onboarding unfinished'}
                  {` · ${lessonsByTeacher.get(t.id) ?? 0} lessons`}
                </p>
              </div>
              <AdminDeleteButton kind="teacher" id={t.id} name={t.full_name || au?.email || 'this teacher'} />
            </div>

            {kids.length > 0 && (
              <div className="k-table" style={{ marginTop: 14 }}>
                <div className="k-table-head" style={{ gridTemplateColumns: 'minmax(140px,1.4fr) minmax(160px,1.6fr) 90px 80px 90px' }}>
                  <span>Student</span><span>Email</span><span>Language</span><span>Lessons</span><span></span>
                </div>
                {kids.map((s) => (
                  <div key={s.id} className="k-row" style={{ gridTemplateColumns: 'minmax(140px,1.4fr) minmax(160px,1.6fr) 90px 80px 90px' }}>
                    <span style={{ fontWeight: 700 }}>
                      {s.full_name}
                      {s.profile_id ? '' : <span style={{ fontWeight: 500, color: 'var(--muted)', fontSize: 11 }}> · no login</span>}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email || '—'}</span>
                    <span style={{ fontSize: 12 }}>{s.language || '—'}</span>
                    <span style={{ fontSize: 12 }}>{lessonsByStudent.get(s.id) ?? 0}</span>
                    <AdminDeleteButton kind="student" id={s.id} name={s.full_name} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}

      {orphanAuth.length > 0 && (
        <section className="k-sec" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Sign-ins with no profile</h3>
          <p className="desc">Signups that broke before a profile was created. Harmless, but they hold the email address hostage.</p>
          {orphanAuth.map((u: any) => (
            <p key={u.id} style={{ fontSize: 13, margin: '8px 0' }}>{u.email} · created {fmt(u.created_at)}</p>
          ))}
        </section>
      )}
    </main>
  )
}
