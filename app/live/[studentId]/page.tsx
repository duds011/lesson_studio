import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LiveDocWindow from '@/components/portal/LiveDocWindow'

export const dynamic = 'force-dynamic'

// Standalone full-window live doc, opened in a popup by teacher or student.
export default async function LiveDocPage({ params }: { params: { studentId: string } }) {
  const studentId = params.studentId
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name, email').eq('id', user.id).single()

  let role: 'teacher' | 'student'
  let name: string

  if (profile?.role === 'teacher') {
    const { data: student } = await supabase.from('students').select('id').eq('id', studentId).eq('teacher_id', user.id).single()
    if (!student) redirect('/')
    role = 'teacher'
    name = (profile as any).full_name || (profile as any).email?.split('@')[0] || 'Teacher'
    // Make sure a doc row exists so persistence + the student's editing work.
    await supabase.from('lesson_docs').upsert({ teacher_id: user.id, student_id: studentId, active: true }, { onConflict: 'student_id' })
  } else {
    const { data: student } = await supabase.from('students').select('id, full_name').eq('id', studentId).eq('profile_id', user.id).single()
    if (!student) redirect('/student/dashboard')
    role = 'student'
    name = (student as any).full_name || 'Student'
  }

  return <LiveDocWindow studentId={studentId} role={role} name={name} title="Lesson notes" />
}
