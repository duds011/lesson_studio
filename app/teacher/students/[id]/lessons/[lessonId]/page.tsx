import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LessonRecapView from '@/components/portal/LessonRecapView'

export const dynamic = 'force-dynamic'

export default async function TeacherLessonPage({ params }: { params: { id: string; lessonId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      id, lesson_number, lesson_date, title, status,
      lesson_summaries ( recap, score, talk_percentage, teacher_note ),
      lesson_sections ( title, content, sort_order ),
      vocabulary_items ( word, reading, definition, explanation, example_sentence, jlpt_level, sort_order ),
      homework_items ( description, sort_order )
    `)
    .eq('id', params.lessonId)
    .single()

  if (!lesson) notFound()

  return (
    <LessonRecapView
      lesson={lesson}
      backHref={`/teacher/students/${params.id}`}
      backLabel="Student"
      showStatus
    />
  )
}
