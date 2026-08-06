import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import PageHeader from '@/components/PageHeader'
import NotesManager, { ManagedNote, StudentOption } from '@/components/NotesManager'

export const dynamic = 'force-dynamic'

export default async function TeacherNotesPage() {
  const supabase = await createClient()
  const user = await requireUser(supabase, '/teacher/notes')

  const [{ data: students }, { data: notes }, { data: lessons }] = await Promise.all([
    supabase.from('students').select('id, full_name').eq('teacher_id', user.id).order('full_name'),
    supabase
      .from('student_notes')
      .select('id, student_id, content, pinned, note_date, created_at, students ( full_name )')
      .order('note_date', { ascending: false }),
    supabase.from('lessons').select('lesson_date').eq('teacher_id', user.id).eq('status', 'published'),
  ])

  const studentOptions: StudentOption[] = (students ?? []).map((s: any) => ({ id: s.id, fullName: s.full_name }))
  const managed: ManagedNote[] = ((notes ?? []) as any[]).map((n) => ({
    id: n.id,
    studentId: n.student_id,
    studentName: (Array.isArray(n.students) ? n.students[0] : n.students)?.full_name ?? '',
    content: n.content,
    pinned: n.pinned,
    note_date: n.note_date,
    created_at: n.created_at,
  }))

  // Published recap count per month, so the header can compare "lessons I
  // noted" with "lessons that got a recap".
  const lessonsThisMonthByPrefix: Record<string, number> = {}
  for (const l of (lessons ?? []) as any[]) {
    const prefix = String(l.lesson_date ?? '').slice(0, 7)
    if (prefix) lessonsThisMonthByPrefix[prefix] = (lessonsThisMonthByPrefix[prefix] ?? 0) + 1
  }

  return (
    <div className="k-page" style={{ display: 'grid', gap: 16 }}>
      <PageHeader
        title="Notes"
        meta="One note per lesson taught — what you covered, and what to pick up next time."
      />
      <NotesManager students={studentOptions} notes={managed} lessonsThisMonthByPrefix={lessonsThisMonthByPrefix} />
    </div>
  )
}
