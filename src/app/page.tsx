// app/page.tsx — Root redirect based on authenticated user's role.
// Server Component: reads session server-side for instant redirect.
// If unauthenticated, the proxy (middleware) will redirect to /login before this runs.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types'

export default async function RootPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    // Proxy should catch unauthenticated users before here, but be safe
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Profile not yet created (race with DB trigger) — show a wait state
    // instead of redirecting to /login (which would cause a loop with proxy.ts)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6 animate-pulse">
          <div className="h-8 w-8 rounded-lg bg-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Setting up your profile...</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          We're preparing your dashboard. This usually takes just a few seconds.
        </p>
        <Link 
          href="/"
          className="mt-8 text-sm font-medium text-primary hover:underline"
        >
          Refresh page
        </Link>
      </div>
    )
  }

  const role = profile.role as Role

  if (role === 'officer' || role === 'admin') {
    redirect('/officer/dashboard')
  } else {
    redirect('/dashboard')
  }
}
