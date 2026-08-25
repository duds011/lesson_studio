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
    .select('recording_id, lesson_date, mic_is, spoken_language')
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
  // mic_is and spoken_language ride along from the queue row: the recorder
  // captured who held the mic and what the room spoke, and dropping either
  // here is how filed recordings used to get flipped speakers and a wrong
  // Whisper language hint on rebuild.
  const { error: linkError } = await admin.from('lesson_event_links').upsert(
    {
      event_id: eventId,
      student_id: studentId,
      teacher_id: auth.user.id,
      mic_is: (pending as any).mic_is ?? null,
      spoken_language: (pending as any).spoken_language ?? null,
    },
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

/**
 * Move a built recap to a different student.
 *
 * The reason a wrong student used to be worth avoiding at all costs: there was
 * no way back from one. Now it is an edit. The link moves, any lesson row moves
 * with it, and the caller rebuilds — from the cached transcript, so it costs a
 * completion rather than another pass over the audio.
 *
 * The rebuild is not optional. A recap names the student throughout and is
 * graded against the language on their record, so a re-linked recap that was
 * not rebuilt is still the old student's recap wearing a new name.
 */
export async function reassignRecapStudent(
  eventId: string,
  studentId: string,
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const admin = createAdminClient()

  const { data: link } = await admin
    .from('lesson_event_links')
    .select('event_id, teacher_id')
    .eq('event_id', eventId)
    .maybeSingle()
  if (!link) return { success: false, error: 'That recording is not linked to anything.' }
  if (link.teacher_id !== auth.user.id) return { success: false, error: 'Not your recording.' }

  const { data: student } = await auth.supabase
    .from('students').select('id').eq('id', studentId).eq('teacher_id', auth.user.id).maybeSingle()
  if (!student) return { success: false, error: 'Student not found.' }

  const { error } = await admin
    .from('lesson_event_links')
    .update({ student_id: studentId })
    .eq('event_id', eventId)
  if (error) return { success: false, error: error.message }

  // A published lesson already has a row of its own; move it too, so the recap
  // does not stay on the old student's record after the rebuild.
  await admin.from('lessons').update({ student_id: studentId }).eq('source_event_id', eventId)

  revalidatePath('/')
  return { success: true }
}
