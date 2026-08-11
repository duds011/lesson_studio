import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDateShort } from '@/lib/portal-utils'
import TestView from '@/components/TestView'
import TestAdminActions from '@/components/portal/TestAdminActions'
import AudioPlayer from '@/components/portal/AudioPlayer'
import { createAdminClient } from '@/lib/supabase/admin'

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

  // The student's speaking answers. Read with the teacher's client (RLS says
  // their tests only), then signed for playback with the admin client.
  const { data: takes } = await supabase
    .from('student_audio_submissions')
    .select('id, prompt_index, path, bucket, created_at')
    .eq('test_id', t.id)
    .order('prompt_index')
  const admin = createAdminClient()
  const speakingPart = (t.test_json?.parts ?? []).find((p: any) => p.key === 'speaking')
  const answers = await Promise.all(((takes ?? []) as any[]).map(async (a) => {
    const { data } = await admin.storage.from(a.bucket).createSignedUrl(a.path, 3600)
    return {
      id: a.id,
      promptIndex: a.prompt_index as number | null,
      url: data?.signedUrl ?? null,
      date: a.created_at ? formatDateShort(a.created_at) : '',
      prompt: a.prompt_index != null ? speakingPart?.prompts?.[a.prompt_index] : null,
    }
  }))

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

      {answers.length > 0 && (
        <div className="lesson-block" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>🎙️ Speaking answers ({answers.length})</h3>
          <p className="analytics-note" style={{ margin: '0 0 12px', fontSize: 12 }}>
            What the student recorded for the speaking part. A re-record replaces the earlier take.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {answers.map((a) => (
              <div key={a.id}>
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700 }}>
                  {a.promptIndex != null ? `${a.promptIndex + 1}. ` : ''}
                  {a.prompt?.prompt_jp ?? 'Speaking answer'}
                </p>
                {a.prompt?.prompt_en && <p className="analytics-note" style={{ margin: '0 0 6px', fontSize: 12 }}>{a.prompt.prompt_en}</p>}
                {a.url
                  ? <AudioPlayer src={a.url} title="Student's answer" meta={a.date} />
                  : <p className="analytics-note">Recording exists but could not be signed for playback.</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {answers.length === 0 && t.status === 'published' && (
        <p className="analytics-note" style={{ margin: '0 0 16px', fontSize: 12 }}>
          No speaking answers recorded yet — they will appear here once the student records them.
        </p>
      )}

      <TestView test={t.test_json} mode="review" />
    </div>
  )
}
