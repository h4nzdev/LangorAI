import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/practice', '/battle', '/leaderboard', '/profile', '/settings']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const isProtected = PROTECTED.some(r => request.nextUrl.pathname.startsWith(r))
  if (!isProtected) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  // Check if profile setup is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  // If no real username set yet (just the auto-generated Player_xxx), send to welcome
  if (!profile || profile.username.startsWith('Player_')) {
    return NextResponse.redirect(new URL('/welcome', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/practice/:path*',
    '/battle/:path*',
    '/leaderboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
}
