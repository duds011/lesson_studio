import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth'
import { formatDateShort } from '@/lib/portal-utils'
import TestView from '@/components/TestView'

export const dynamic = 'force-dynamic'

export default async function StudentTestPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const user = await requireUser(supabase, `/student/tests/${params.id}`)

  // RLS only returns published tests that belong to this student.
  const { data: test } = await supabase
    .from('tests')
    .select('id, title, level, test_json, published_at, lessons ( lesson_number )')
    .eq('id', params.id)
    .single()

  if (!test) notFound()

  // The most recent attempt, if there is one. RLS scopes this to the signed-in
  // student, so no ownership filter is needed here.
  const { data: lastAttempt } = await supabase
    .from('test_attempts')
    .select('score, correct, total, submitted_at')
    .eq('test_id', params.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const t = test as any
  const lesson = Array.isArray(t.lessons) ? t.lessons[0] : t.lessons
  const parts = (t.test_json?.parts ?? []) as any[]
  const questionCount = parts.reduce((n, p) => {
    if (p.questions) return n + p.questions.length
    if (p.passages) return n + p.passages.reduce((m: number, x: any) => m + (x.questions?.length ?? 0), 0)
    if (p.prompts) return n + p.prompts.length
    return n
  }, 0)

  return (
    <div style={{ maxWidth: 900 }}>
      <Link href="/student/dashboard" className="k-back">← Dashboard</Link>

      <header className="k-phead">
        <div>
          <div className="k-phead-eyebrow">{t.level} Practice Test</div>
          <h1>{t.title}</h1>
          <div className="k-pmeta">
            {lesson && <span>From lesson {lesson.lesson_number}</span>}
            <span>{formatDateShort(t.published_at)}</span>
            {questionCount > 0 && <span>{questionCount} questions</span>}
          </div>
        </div>

        <div className="k-hero-art" style={{ right: -20, opacity: .5 }} aria-hidden>
          <span className="k-crystal" style={{ width: 58, height: 68, right: 30, top: 20 }} />
          <span className="k-ring" style={{ width: 50, height: 50, right: 100, top: 78 }} />
        </div>
      </header>

      <TestView
        test={t.test_json}
        mode="take"
        testId={t.id}
        savedScore={(lastAttempt as any)?.score ?? null}
      />
    </div>
  )
}
