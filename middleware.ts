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

  // Route buckets. The student PORTAL is /student/* (note: /students is the
  // teacher's student list, so match /student/ with a trailing slash).
  const isStudentPortal = path === '/student' || path.startsWith('/student/')
  const isTeacherArea =
    path === '/' ||
    path.startsWith('/settings') ||
    path.startsWith('/students') ||
    path.startsWith('/teacher')
  // Shared live-doc window — either role may open it (the page authorizes).
  const isLive = path.startsWith('/live')

  // Not logged in → send to login for any gated route.
  if (!user && (isTeacherArea || isStudentPortal || isLive)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const roleOf = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      return profile?.role
    }

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
  // NB: /book and all /api/* routes are deliberately excluded so the public
  // booking page and the Google/Zoom OAuth callbacks keep working without login.
  matcher: ['/', '/login', '/settings/:path*', '/students/:path*', '/student/:path*', '/teacher/:path*', '/live/:path*'],
}
