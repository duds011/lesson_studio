import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

/**
 * Auth guard for the Supabase-backed portal ONLY.
 *
 * The matcher below deliberately scopes this middleware to /login, /student/*
 * and /teacher/* so the existing teacher tooling (/, /students, /settings,
 * /book, /api/*) keeps working exactly as before with no login required.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anon = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  // If Supabase isn't configured yet, don't block anything.
  if (!url || !anon) return supabaseResponse

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh session — must come before any redirect.
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  const roleOf = async () => {
    if (!user) return null
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    return profile?.role ?? null
  }

  // Teacher-only API routes that previously relied only on the login wall.
  // Guarded here so they stay locked once production is public.
  const isProtectedApi =
    path.startsWith('/api/recall') ||
    path.startsWith('/api/recap') ||
    path === '/api/settings' ||
    path === '/api/google/disconnect' ||
    path === '/api/google/select-calendar' ||
    path === '/api/zoom/disconnect' ||
    path === '/api/zoom/status'
  if (isProtectedApi) {
    if ((await roleOf()) !== 'teacher') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    return supabaseResponse
  }

  // Route buckets. The student PORTAL is /student/* (note: /students is the
  // teacher's student list, so match /student/ with a trailing slash).
  const isStudentPortal = path === '/student' || path.startsWith('/student/')
  const isTeacherArea =
    path === '/' ||
    path.startsWith('/settings') ||
    path.startsWith('/students') ||
    path.startsWith('/teacher')
  // Not logged in → send to login for any gated route.
  if (!user && (isTeacherArea || isStudentPortal)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    // Already authed and hitting the login page → route to the right home.
    if (path === '/login') {
      const role = await roleOf()
      const dest = role === 'teacher' ? '/' : '/student/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }

    // Keep teachers and students in their own areas.
    if (isTeacherArea && (await roleOf()) !== 'teacher') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }
    if (isStudentPortal && (await roleOf()) !== 'student') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  // NB: public /api routes (/api/book, Google/Zoom OAuth callbacks, /api/stripe,
  // /api/portal, /api/cron) are deliberately NOT matched. Only the teacher-only
  // API routes below are gated (they had no auth of their own).
  matcher: [
    '/', '/login', '/settings/:path*', '/students/:path*', '/student/:path*', '/teacher/:path*',
    '/api/recall/:path*', '/api/recap', '/api/recap/:path*',
    '/api/settings', '/api/google/disconnect', '/api/google/select-calendar',
    '/api/zoom/disconnect', '/api/zoom/status',
  ],
}
