'use server'

/**
 * Filing a recording under a student.
 *
 * The recorder stopped asking who the lesson was with — teachers were leaving
 * the dropdown on whoever it held last time, and a recap under the wrong name
 * is invisible until someone reads it. The audio arrives unfiled and this is
 * where it gets a student, with the whole list in front of the teacher.
 */
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireTeacher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' as const }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return { error: 'Unauthorized' as const }
  return { user, supabase }
}

export type PendingRecording = {
  recordingId: string
  minutes: number | null
  lessonDate: string | null
  createdAt: string
  /** Set when one of the two tracks came back essentially silent. */
  quiet: string | null
}

const SILENT_SEC = 5

export async function listPendingRecordings(): Promise<PendingRecording[]> {
  const auth = await requireTeacher()
  if ('error' in auth) return []

  const { data } = await createAdminClient()
    .from('pending_recordings')
    .select('recording_id, seconds, lesson_date, created_at, heard')
    .eq('teacher_id', auth.user.id)
    .order('created_at', { ascending: true })

  return ((data ?? []) as any[]).map((r) => {
    const heard = r.heard || {}
    const quiet =
      (heard.mic ?? 99) < SILENT_SEC ? 'your microphone'
      : (heard.tab ?? 99) < SILENT_SEC ? 'your student’s track'
      : null
    return {
      recordingId: r.recording_id,
      minutes: r.seconds ? Math.round(r.seconds / 60) : null,
      lessonDate: r.lesson_date ?? null,
      createdAt: r.created_at,
      quiet,
    }
  })
}

/**
 * Attach a waiting recording to a student.
 *
 * Only writes the link and clears the queue entry — the caller then asks
 * /api/recap/build to do the work, which is the same route "Rebuild from
 * recording" already uses. Nothing here is a second copy of that.
 */
export async function assignRecording(
  recordingId: string,
  studentId: string,
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const admin = createAdminClient()

  const { data: pending } = await admin
    .from('pending_recordings')
    .select('recording_id, lesson_date')
    .eq('recording_id', recordingId)
    .eq('teacher_id', auth.user.id)
    .maybeSingle()
  if (!pending) return { success: false, error: 'That recording is no longer waiting.' }

  // Their student, checked with their own client so RLS confirms it rather
  // than the action taking the id on trust.
  const { data: student } = await auth.supabase
    .from('students').select('id').eq('id', studentId).eq('teacher_id', auth.user.id).maybeSingle()
  if (!student) return { success: false, error: 'Student not found.' }

  const eventId = `ext:${recordingId}`
  const { error: linkError } = await admin.from('lesson_event_links').upsert(
    { event_id: eventId, student_id: studentId, teacher_id: auth.user.id },
    { onConflict: 'event_id' },
  )
  if (linkError) return { success: false, error: linkError.message }

  // Out of the queue only once the link exists, so a failure here leaves the
  // recording visible rather than stranded.
  await admin.from('pending_recordings').delete().eq('recording_id', recordingId)

  revalidatePath('/')
  return { success: true, eventId }
}

/** Throw away a recording nobody wants — a test, or a call that was not a lesson. */
export async function discardRecording(recordingId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const { error } = await createAdminClient()
    .from('pending_recordings')
    .delete()
    .eq('recording_id', recordingId)
    .eq('teacher_id', auth.user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/')
  return { success: true }
}
