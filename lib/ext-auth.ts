/**
 * Auth for the browser-extension recorder.
 *
 * The extension is not a browser session — there are no cookies to send — so it
 * carries a bearer token instead. One shared token identifies one teacher,
 * which is right for a single-teacher install; a per-teacher token column is
 * the obvious upgrade when this ships to more than one person.
 */
import { createAdminClient } from '@/lib/supabase/admin'

export type ExtCaller = { teacherId: string }

export async function authenticateExtension(req: Request): Promise<ExtCaller | null> {
  const expected = process.env.EXT_API_TOKEN
  if (!expected) return null

  const header = req.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  // Length check first so the comparison below cannot leak length by timing.
  if (!token || token.length !== expected.length) return null
  let diff = 0
  for (let i = 0; i < token.length; i++) diff |= token.charCodeAt(i) ^ expected.charCodeAt(i)
  if (diff !== 0) return null

  const teacherId = process.env.EXT_TEACHER_ID
  if (teacherId) return { teacherId }

  // Not pinned to a teacher: fall back to the only teacher on the install.
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('id').eq('role', 'teacher').limit(2)
  if (!data || data.length !== 1) return null
  return { teacherId: data[0].id }
}
