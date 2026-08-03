import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { authenticateExtension } from '@/lib/ext-auth'

export const dynamic = 'force-dynamic'

/** The teacher's students, for the extension's "assign this recording to" picker. */
export async function GET(req: Request) {
  const caller = await authenticateExtension(req)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('students')
    .select('id, full_name')
    .eq('teacher_id', caller.teacherId)
    .order('full_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (new URL(req.url).searchParams.get('debug') === '1') {
    const all = await admin.from('students').select('id, full_name, teacher_id')
    return NextResponse.json({
      students: data ?? [],
      teacherId: caller.teacherId,
      allStudents: all.data ?? [],
      allError: all.error?.message ?? null,
    })
  }

  return NextResponse.json({ students: data ?? [] })
}
