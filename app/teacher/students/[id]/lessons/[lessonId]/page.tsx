import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { brandVars, resolveBrand } from '@/lib/brand'
import { formatDateShort, lessonDisplayTitle } from '@/lib/portal-utils'
import LessonPageTabs from '@/components/LessonPageTabs'
import CountUp from '@/components/portal/CountUp'
import LessonExchange from '@/components/portal/LessonExchange'
import MemoPlayer from '@/components/portal/MemoPlayer'
import { isMemo } from '@/components/portal/LessonMemo'
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
      students ( full_name, language )`)
    .eq('id', params.lessonId)
    .single()

  if (!lesson) notFound()

  const l = lesson as any
  const summary = Array.isArray(l.lesson_summaries) ? l.lesson_summaries[0] : l.lesson_summaries
  const recap = summary?.recap_json
  const studentRow = Array.isArray(l.students) ? l.students[0] : l.students
  const studentName = studentRow?.full_name ?? ''

  if (!recap) notFound()

  // Same branding the student's copy of this recap is rendered with, so this
  // page is a preview of theirs rather than a different page about it.
  const [{ data: files }, { data: audios }, { data: profile }] = await Promise.all([
    supabase.from('lesson_attachments').select('id, file_name, created_at, content_type').eq('lesson_id', l.id).order('created_at', { ascending: false }),
    supabase.from('student_audio_submissions').select('id, file_name, created_at, prompt_index').eq('lesson_id', l.id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('brand, full_name, speaking_submissions').eq('id', user.id).single(),
  ])
  const brand = resolveBrand((profile as any)?.brand)
  const teacherFirst = ((profile as any)?.full_name ?? '').split(' ')[0] || 'You'
  const memos = (files || []).filter(isMemo)

  // Answers to a speaking exercise play under that exercise; free-form
  // practice audio stays in the file drawer. Same split as the student's page.
  const takes = (audios || []).filter((a: any) => a.prompt_index != null)
  const practice = (audios || []).filter((a: any) => a.prompt_index == null)
  const speakingEnabled = (profile as any)?.speaking_submissions !== false

  // 1180 to match the student's copy — this page is a preview of theirs.
  return (
    <div className="k-scope page-fade" style={{ maxWidth: 1180, ...brandVars(brand) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <LessonAdminActions lessonId={l.id} studentId={params.id} sourceEventId={l.source_event_id} />
      </div>

      <header className={`k-phead${memos.length > 0 ? ' has-memo' : ''}`}>
        <div className="k-phead-top">
          <div>
            <div className="k-phead-eyebrow">Lesson {l.lesson_number} · Recap</div>
            <h1>{lessonDisplayTitle(recap, l.title, l.lesson_number)}</h1>
            {/* Just the date and the status: the student's name is the back link,
                and "1st lesson"/confidence repeated what the eyebrow and score
                already say — the pills were crowding the band. */}
            <div className="k-pmeta">
              <span>{formatDateShort(l.lesson_date)}</span>
              <span className={`status-pill ${l.status === 'published' ? 'published' : 'draft'}`}>{l.status}</span>
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

        {/* Exactly what the student sees: the memo if one was recorded, nothing
            if not. This page is the final product — recording (with its
            reference script) lives in review/edit, not here. */}
        {memos.length > 0 && (
          <div className="k-phead-memo">
            {memos.map((f: any) => (
              <MemoPlayer
                key={f.id}
                src={`/api/portal/download?kind=file&id=${f.id}`}
                title="Voice memo"
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
        studentFirst={studentName.split(' ')[0] || 'Student'}
        teacherFirst={teacherFirst}
        brand={brand}
        language={studentRow?.language ?? null}
        back={{ href: `/teacher/students/${params.id}`, label: studentName || 'Student' }}
        speaking={{ lessonId: l.id, enabled: speakingEnabled, role: 'teacher', takes: takes as any }}
        files={<LessonExchange lessonId={l.id} role="teacher" files={files || []} audios={practice} />}
      />
    </div>
  )
}
