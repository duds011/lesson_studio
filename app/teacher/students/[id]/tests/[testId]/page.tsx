import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDateShort } from '@/lib/portal-utils'
import TestView from '@/components/TestView'
import TestAdminActions from '@/components/portal/TestAdminActions'

export const dynamic = 'force-dynamic'

export default async function TeacherTestReviewPage({ params }: { params: { id: string; testId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: test } = await supabase
    .from('tests')
    .select('id, title, level, status, test_json, created_at, student_id, lessons ( lesson_number, title )')
    .eq('id', params.testId)
    .single()

  if (!test || (test as any).student_id !== params.id) notFound()

  const t = test as any
  const lesson = Array.isArray(t.lessons) ? t.lessons[0] : t.lessons

  return (
    <div className="page-fade" style={{ maxWidth: 860 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <Link href={`/teacher/students/${params.id}`} className="btn btn-ghost btn-sm">← Student</Link>
        <TestAdminActions testId={t.id} studentId={params.id} status={t.status} />
      </div>

      <div className="lesson-hero">
        <div>
          <div className="eyebrow">{t.level} Practice Test · {t.status === 'published' ? 'Published' : 'Draft — only you can see this'}</div>
          <h1>{t.title}</h1>
          <div className="lesson-meta">
            {lesson && <div className="meta-box"><div className="meta-label">Based on</div><div className="meta-value">Lesson {lesson.lesson_number}</div></div>}
            {t.test_json?.script && (
              <div className="meta-box"><div className="meta-label">Script</div><div className="meta-value">{{ beginner: 'Hiragana + romaji', hiragana: 'Hiragana', kanji: 'Kanji + kana' }[t.test_json.script as string] ?? t.test_json.script}</div></div>
            )}
            <div className="meta-box"><div className="meta-label">Created</div><div className="meta-value">{formatDateShort(t.created_at)}</div></div>
            <div className="meta-box"><div className="meta-label">Status</div><div className="meta-value"><span className={`status-pill ${t.status === 'published' ? 'published' : 'draft'}`}>{t.status}</span></div></div>
          </div>
        </div>
      </div>

      <p className="analytics-note" style={{ margin: '0 0 16px', fontSize: 12 }}>
        Teacher review — correct answers are highlighted and explanations shown. The student gets the interactive version.
      </p>

      <TestView test={t.test_json} mode="review" />
    </div>
  )
}
