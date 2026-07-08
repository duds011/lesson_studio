import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDateShort, ordinal } from '@/lib/portal-utils'
import LessonPageTabs from '@/components/LessonPageTabs'
import LessonExchange from '@/components/portal/LessonExchange'
import LessonAdminActions from '@/components/portal/LessonAdminActions'

export const dynamic = 'force-dynamic'

export default async function TeacherLessonPage({ params }: { params: { id: string; lessonId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`id, lesson_number, lesson_date, title, status, source_event_id,
      lesson_summaries ( recap_json, score ),
      students ( full_name )`)
    .eq('id', params.lessonId)
    .single()

  if (!lesson) notFound()

  const l = lesson as any
  const summary = Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries
  const recap = summary?.recap_json
  const studentName = (Array.isArray(l.students) ? l.students[0] : l.students)?.full_name ?? ''

  if (!recap) notFound()

  const [{ data: files }, { data: audios }] = await Promise.all([
    supabase.from('lesson_attachments').select('id, file_name, created_at').eq('lesson_id', l.id).order('created_at', { ascending: false }),
    supabase.from('student_audio_submissions').select('id, file_name, created_at').eq('lesson_id', l.id).order('created_at', { ascending: false }),
  ])

  return (
    <div className="page-fade" style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <Link href={`/teacher/students/${params.id}`} className="btn btn-ghost btn-sm">← {studentName || 'Student'}</Link>
        <LessonAdminActions lessonId={l.id} studentId={params.id} sourceEventId={l.source_event_id} />
      </div>
      <div className="lesson-hero">
        <div>
          <div className="eyebrow">Lesson {l.lesson_number} · Recap</div>
          <h1>{l.title || `Lesson ${l.lesson_number}`}</h1>
          <div className="lesson-meta">
            <div className="meta-box"><div className="meta-label">Student</div><div className="meta-value">{studentName}</div></div>
            <div className="meta-box"><div className="meta-label">Date</div><div className="meta-value">{formatDateShort(l.lesson_date)}</div></div>
            <div className="meta-box"><div className="meta-label">Status</div><div className="meta-value"><span className={`status-pill ${l.status === 'published' ? 'published' : 'draft'}`}>{l.status}</span></div></div>
          </div>
        </div>
        {recap.score != null && <div className="lesson-score"><div><strong>{recap.score}</strong><span>OUT OF 10</span></div></div>}
      </div>

      <LessonPageTabs
        lesson={{ id: l.id, lessonNumber: l.lesson_number, date: l.lesson_date, title: l.title, recap }}
        studentFirst={studentName.split(' ')[0] || 'Student'}
        teacherFirst="Noa"
      />

      <LessonExchange lessonId={l.id} role="teacher" files={files || []} audios={audios || []} />
    </div>
  )
}
