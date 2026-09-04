import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticateExtension } from '@/lib/ext-auth'

export const dynamic = 'force-dynamic'

/**
 * Who the extension is signed in as, and who it can record.
 *
 * It also hands back the teacher's own details so the recorder can fill itself
 * in — the language they teach and their name — rather than asking them to
 * retype what the app already knows.
 */
export async function GET(req: Request) {
  const caller = await authenticateExtension(req)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const [{ data, error }, { data: profile }] = await Promise.all([
    // `*` rather than a column list: `spoken_language` arrives in migration
    // 0032, and a named column that does not exist yet fails the whole request
    // rather than coming back empty.
    admin.from('students').select('*').eq('teacher_id', caller.teacherId).order('full_name'),
    admin.from('profiles').select('full_name, teaching_language, speaking_language').eq('id', caller.teacherId).maybeSingle(),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  /**
   * Only the fields the recorder uses, with the spoken language already
   * resolved.
   *
   * That last one replaced a dropdown. The recorder used to ask, before every
   * lesson, what the hour would be spoken in — a fact about the student, not
   * about the hour. It is answered on their record now, falling back to the
   * teacher's own onboarding answer, and /api/ext/complete trusts the same
   * resolution over anything the extension sends.
   */
  const teacherSpoken = (profile as any)?.speaking_language ?? null
  const students = (data ?? []).map((s: any) => ({
    id: s.id,
    full_name: s.full_name,
    language: s.language,
    spoken_language: (typeof s.spoken_language === 'string' && s.spoken_language.trim()) || teacherSpoken || 'English',
  }))

  return NextResponse.json({
    students,
    teacher: {
      name: (profile as any)?.full_name ?? null,
      // Kept for extensions that have not updated yet: they still fill their
      // own dropdown from these. Newer builds ignore them and read each
      // student's `spoken_language` above.
      language: (profile as any)?.teaching_language ?? null,
      speaking: teacherSpoken,
    },
  })
}
