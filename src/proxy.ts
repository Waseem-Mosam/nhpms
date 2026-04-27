// proxy.ts (Next.js 16+: replaces middleware.ts)
// Runs on every request to:
//   1. Refresh the Supabase session (keeps JWT fresh without user action)
//   2. Redirect unauthenticated users to /login
//   3. Redirect authenticated users away from auth pages to their dashboard
//
// Role-based route protection (farmer vs officer) is handled by the
// RoleGuard component inside each route group, NOT here, because
// reading the profile role requires a DB query that adds latency to
// every request. Proxy stays fast by only checking auth state.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Routes that do not require authentication */
const PUBLIC_ROUTES = ['/login', '/register']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // IMPORTANT: Do not write any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  if (!user && !isPublicRoute) {
    // Unauthenticated user trying to access a protected route → send to login
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  if (user && isPublicRoute) {
    // Authenticated user trying to access login/register → send to root
    // Root page.tsx will then redirect based on their role
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    return NextResponse.redirect(homeUrl)
  }

  // Return supabaseResponse to ensure cookies are properly forwarded.
  // Do not return a plain NextResponse.next() here.
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Public assets in /public
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
