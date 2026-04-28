'use client'

// components/shared/RoleGuard.tsx
// Client Component that reads the current user profile and redirects if the
// user's role does not match the allowed roles for this route group.
//
// Usage:
//   In a farmer route layout: <RoleGuard allowedRoles={['farmer', 'admin']}>…</RoleGuard>
//   In an officer route layout: <RoleGuard allowedRoles={['officer', 'admin']}>…</RoleGuard>
//
// Why client-side and not server-side?
//   The proxy (proxy.ts) handles session auth at the edge.
//   Role checking requires a DB profile lookup which adds per-request latency;
//   doing it once in a layout component and caching via React keeps it fast.
//   See implementation-plan.md § Auth & Routing Rules.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Role } from '@/types'
import { Leaf } from 'lucide-react'

type Props = {
  allowedRoles: Role[]
  children: React.ReactNode
}

type GuardState = 'loading' | 'allowed' | 'denied'

export default function RoleGuard({ allowedRoles, children }: Props) {
  const router = useRouter()
  const [state, setState] = useState<GuardState>('loading')

  useEffect(() => {
    let cancelled = false

    async function checkRole() {
      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        if (!cancelled) router.replace('/login')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        if (!cancelled) router.replace('/login')
        return
      }

      const role = profile.role as Role

      if (!allowedRoles.includes(role)) {
        // User is authenticated but their role doesn't match this route group.
        // Redirect to their correct dashboard instead.
        if (!cancelled) {
          if (role === 'officer' || role === 'admin') {
            router.replace('/officer/dashboard')
          } else {
            router.replace('/dashboard')
          }
        }
        if (!cancelled) setState('denied')
        return
      }

      if (!cancelled) setState('allowed')
    }

    checkRole()
    return () => {
      cancelled = true
    }
  }, [allowedRoles, router])

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary animate-pulse">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    )
  }

  // 'denied' case: redirect is in flight; render nothing to avoid flash
  if (state === 'denied') return null

  return <>{children}</>
}
