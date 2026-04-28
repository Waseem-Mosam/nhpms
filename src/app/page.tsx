// app/page.tsx — Root redirect based on authenticated user's role.
// Server Component: reads session server-side for instant redirect.
// If unauthenticated, the proxy (middleware) will redirect to /login before this runs.

import { redirect } from 'next/navigation'
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
    // Profile not yet created (race with DB trigger) — retry via login
    redirect('/login')
  }

  const role = profile.role as Role

  if (role === 'officer' || role === 'admin') {
    redirect('/officer/dashboard')
  } else {
    redirect('/dashboard')
  }
}
