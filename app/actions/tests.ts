'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { gradeTest, type Answers } from '@/lib/test-grading'

export interface SubmitAttemptResult {
  success: boolean
  score?: number
  correct?: number
  total?: number
  error?: string
}

/**
 * Records a finished practice test.
 *
 * The client sends its answers, never its score: the test's answer key is read
 * back here and the answers are re-graded against it. A student marking their
 * own homework is fine; a stored record that says 100% because the browser said
 * so is not.
 *
 * Reads and writes go through the caller's own session rather than the admin
 * client, so RLS is what decides the test is theirs to take — the same rule the
 * page that showed it to them used.
 */
export async function submitTestAttempt(testId: string, answers: Answers): Promise<SubmitAttemptResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  // RLS returns this row only if the test is published and belongs to the
  // signed-in student, so no further ownership check is needed here.
  const { data: test } = await supabase
    .from('tests')
    .select('id, student_id, test_json')
    .eq('id', testId)
    .single()

  if (!test) return { success: false, error: 'Test not found' }

  const grade = gradeTest((test as any).test_json, answers ?? {})
  if (grade.total === 0) return { success: false, error: 'This test has nothing to grade.' }

  const { error } = await supabase.from('test_attempts').insert({
    test_id: test.id,
    student_id: (test as any).student_id,
    correct: grade.correct,
    total: grade.total,
    score: grade.score,
    answers: answers ?? {},
  })
  if (error) return { success: false, error: error.message }

  revalidatePath('/student/dashboard')
  revalidatePath(`/student/tests/${testId}`)
  return { success: true, score: grade.score, correct: grade.correct, total: grade.total }
}
