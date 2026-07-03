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

  // Not logged in → send to login for protected routes.
  if (!user && (path.startsWith('/teacher') || path.startsWith('/student'))) {
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

    // Already authed and hitting the login page → route to the right dashboard.
    if (path === '/login') {
      const role = await roleOf()
      const dest = role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }

    // Keep teachers and students in their own areas.
    if (path.startsWith('/teacher') || path.startsWith('/student')) {
      const role = await roleOf()
      if (path.startsWith('/teacher') && role !== 'teacher') {
        return NextResponse.redirect(new URL('/student/dashboard', request.url))
      }
      if (path.startsWith('/student') && role !== 'student') {
        return NextResponse.redirect(new URL('/teacher/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/login', '/student/:path*', '/teacher/:path*'],
}
