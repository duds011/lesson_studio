import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveBrand } from '@/lib/brand'
import { formatDateShort, lessonDisplayTitle } from '@/lib/portal-utils'
import LessonPageTabs from '@/components/LessonPageTabs'
import CountUp from '@/components/portal/CountUp'
import LessonExchange from '@/components/portal/LessonExchange'
import MemoPlayer from '@/components/portal/MemoPlayer'
import { isMemo } from '@/components/portal/LessonMemo'

export const dynamic = 'force-dynamic'

export default async function StudentLessonPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const user = await requireUser(supabase, `/student/lessons/${params.id}`)

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`id, lesson_number, lesson_date, title,
      lesson_summaries ( recap_json, score ),
      students ( full_name, teacher_id, language )`)
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
    supabase.from('student_audio_submissions').select('id, file_name, created_at, prompt_index').eq('lesson_id', l.id).order('created_at', { ascending: false }),
    student?.teacher_id
      ? admin.from('profiles').select('brand, full_name, speaking_submissions').eq('id', student.teacher_id).single()
      : Promise.resolve({ data: null }),
  ])
  const brand = resolveBrand((teacherProfile as any)?.brand)
  const teacherFirst = ((teacherProfile as any)?.full_name ?? '').split(' ')[0] || 'Your teacher'
  const memos = (files || []).filter(isMemo)

  // Two kinds of audio share the table: answers to a speaking exercise, which
  // belong under the exercise they answer, and free-form practice for the
  // lesson, which belongs in the file drawer. Splitting them here keeps each
  // in one place instead of both.
  const takes = (audios || []).filter((a: any) => a.prompt_index != null)
  const practice = (audios || []).filter((a: any) => a.prompt_index == null)
  const speakingEnabled = (teacherProfile as any)?.speaking_submissions !== false

  // Wider than the old 900: the recap's movements put a section rail beside
  // the content on a laptop, and 900 left the opened part cramped.
  return (
    <div style={{ maxWidth: 1180 }}>
      <header className={`k-phead${memos.length > 0 ? ' has-memo' : ''}`}>
        <div className="k-phead-top">
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
        </div>

        {/* The teacher's voice memo — the one part of the recap spoken to this
            student personally, so it opens the page rather than hiding a tab
            deep, across the full width of the band. No memo recorded, nothing
            shown: this is the final product, and it never mentions what wasn't
            made for it. */}
        {memos.length > 0 && (
          <div className="k-phead-memo">
            {memos.map((f: any) => (
              <MemoPlayer
                key={f.id}
                src={`/api/portal/download?kind=file&id=${f.id}`}
                title={`A message from ${teacherFirst}`}
                meta={formatDateShort(f.created_at)}
              />
            ))}
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
        language={student?.language ?? null}
        back={{ href: '/student/dashboard', label: 'Dashboard' }}
        speaking={{ lessonId: l.id, enabled: speakingEnabled, role: 'student', takes: takes as any }}
        files={<LessonExchange lessonId={l.id} role="student" files={files || []} audios={practice} />}
      />
    </div>
  )
}
