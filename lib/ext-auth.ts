/**
 * Auth for the browser-extension recorder.
 *
 * The extension is not a browser session — there are no cookies to send — so it
 * carries a bearer token instead. Each teacher has their OWN token, which is
 * what makes the recorder safe to hand to more than one person: the token says
 * whose lesson this is, rather than the server having to guess.
 *
 * It used to compare against a single shared EXT_API_TOKEN and then work out
 * the teacher by looking for "the only teacher on this install". That returned
 * 401 for everyone the moment a second teacher signed up, and would have filed
 * every teacher's recordings under one account if it hadn't.
 */
import { createAdminClient } from '@/lib/supabase/admin'

export type ExtCaller = { teacherId: string }

function bearer(req: Request): string {
  const header = req.headers.get('authorization') || ''
  return header.startsWith('Bearer ') ? header.slice(7).trim() : ''
}

/** Constant-time compare, so a wrong token cannot be found by timing it. */
function sameToken(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function authenticateExtension(req: Request): Promise<ExtCaller | null> {
  const token = bearer(req)
  if (!token || token.length < 20) return null

  const admin = createAdminClient()

  /**
   * A signed-in teacher: the extension signs in with the same email and
   * password as the app and sends the session token, so there is no key to
   * copy across and no second credential to lose. Three dots' worth of JWT is
   * the tell — a stored token is opaque and has none.
   */
  if (token.split('.').length === 3) {
    const { data: authed } = await admin.auth.getUser(token)
    if (!authed?.user) return null
    const { data: profile } = await admin
      .from('profiles').select('role').eq('id', authed.user.id).maybeSingle()
    return profile?.role === 'teacher' ? { teacherId: authed.user.id } : null
  }

  // The teacher this token belongs to. Unique index, so this is exact.
  const { data: row } = await admin
    .from('teacher_ext_tokens')
    .select('teacher_id')
    .eq('token', token)
    .maybeSingle()

  if (row?.teacher_id) {
    // Best-effort: lets a teacher see whether their extension is actually
    // talking to us, without failing the request if the write does.
    admin.from('teacher_ext_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('teacher_id', row.teacher_id)
      .then(undefined, () => {})
    return { teacherId: row.teacher_id }
  }

  // Legacy single-token install: only honoured when it says WHICH teacher it
  // means. Without that it is ambiguous, and guessing is what broke before.
  const legacy = process.env.EXT_API_TOKEN
  const legacyTeacher = process.env.EXT_TEACHER_ID
  if (legacy && legacyTeacher && sameToken(token, legacy)) {
    return { teacherId: legacyTeacher }
  }

  return null
}
