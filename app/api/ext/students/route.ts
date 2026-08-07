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
    admin.from('students').select('id, full_name, language').eq('teacher_id', caller.teacherId).order('full_name'),
    admin.from('profiles').select('full_name, teaching_language').eq('id', caller.teacherId).maybeSingle(),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    students: data ?? [],
    teacher: {
      name: (profile as any)?.full_name ?? null,
      language: (profile as any)?.teaching_language ?? null,
    },
  })
}
