import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveBrand } from '@/lib/brand'
import { formatDateShort, lessonDisplayTitle } from '@/lib/portal-utils'
import LessonPageTabs from '@/components/LessonPageTabs'
import CountUp from '@/components/portal/CountUp'
import LessonExchange from '@/components/portal/LessonExchange'
import LessonMemo, { isMemo } from '@/components/portal/LessonMemo'

export const dynamic = 'force-dynamic'

export default async function StudentLessonPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const user = await requireUser(supabase, `/student/lessons/${params.id}`)

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`id, lesson_number, lesson_date, title,
      lesson_summaries ( recap_json, score ),
      students ( full_name, teacher_id )`)
    .eq('id', params.id)
    .single()

  if (!lesson) notFound()

  const l = lesson as any
  const summary = Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries
  const recap = summary?.recap_json
  const student = Array.isArray(l.students) ? l.students[0] : l.students
  const studentName = student?.full_name ?? ''

  if (!recap) notFound()

  // The teacher owns how this page is arranged — same brand the studio edits.
  const admin = createAdminClient()
  const [{ data: files }, { data: audios }, { data: teacherProfile }] = await Promise.all([
    supabase.from('lesson_attachments').select('id, file_name, created_at, content_type').eq('lesson_id', l.id).order('created_at', { ascending: false }),
    supabase.from('student_audio_submissions').select('id, file_name, created_at').eq('lesson_id', l.id).order('created_at', { ascending: false }),
    student?.teacher_id
      ? admin.from('profiles').select('brand, full_name').eq('id', student.teacher_id).single()
      : Promise.resolve({ data: null }),
  ])
  const brand = resolveBrand((teacherProfile as any)?.brand)
  const teacherFirst = ((teacherProfile as any)?.full_name ?? '').split(' ')[0] || 'Your teacher'

  return (
    <div style={{ maxWidth: 900 }}>
      <Link href="/student/dashboard" className="k-back">← Dashboard</Link>

      <header className="k-phead">
        <div>
          <div className="k-phead-eyebrow">Lesson {l.lesson_number} · Recap</div>
          <h1>{lessonDisplayTitle(recap, l.title, l.lesson_number)}</h1>
          {/* Date only — "1st lesson" repeated the eyebrow and the confidence
              label crowded the band (same trim as the teacher's copy). */}
          <div className="k-pmeta">
            <span>{formatDateShort(l.lesson_date)}</span>
          </div>
        </div>
        {recap.score != null && (
          <div className="k-pscore">
            <div>
              <b><CountUp value={Number(recap.score)} decimals={Number.isInteger(Number(recap.score)) ? 0 : 1} /></b>
              <small>OUT OF 10</small>
            </div>
          </div>
        )}

        {/* Shifted left of the score bubble — at right:-30 the orb floated
            straight over the score, and the translucent bubble let it through. */}
        <div className="k-hero-art" style={{ right: 150, opacity: .4 }} aria-hidden>
          <span className="k-orb" style={{ width: 70, height: 70, right: 0, top: 10 }} />
          <span className="k-tube" style={{ width: 56, height: 56, right: 60, top: 74, transform: 'rotate(40deg)' }} />
        </div>
      </header>

      <LessonPageTabs
        lesson={{ id: l.id, lessonNumber: l.lesson_number, date: l.lesson_date, title: l.title, recap }}
        studentFirst={studentName.split(' ')[0] || 'You'}
        teacherFirst={teacherFirst}
        brand={brand}
        memo={<LessonMemo memos={(files || []).filter(isMemo)} lessonId={l.id} role="student" teacherFirst={teacherFirst} />}
        files={<LessonExchange lessonId={l.id} role="student" files={files || []} audios={audios || []} />}
      />
    </div>
  )
}
