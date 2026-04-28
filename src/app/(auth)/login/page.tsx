'use client'

import { Suspense, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Leaf, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Role } from '@/types'

// Separated because useSearchParams() requires a Suspense boundary
function RegisteredBanner() {
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  if (!justRegistered) return null

  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Account created successfully. Please check your email to confirm your address, then sign
        in below.
      </span>
    </div>
  )
}

function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Email address is required.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }

    startTransition(async () => {
      const supabase = createClient()

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        // Do not leak whether the email exists — use a generic message
        setError('Invalid email or password. Please try again.')
        return
      }

      // Fetch the profile to determine the role for redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single()

      const role = profile?.role as Role | undefined

      if (role === 'officer' || role === 'admin') {
        router.push('/officer/dashboard')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    })
  }

  return (
    <>
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          id="login-submit"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <span className="block text-sm font-bold text-primary leading-tight">NHPMS</span>
            <span className="block text-xs text-muted-foreground leading-tight">
              National Horticulture Production Monitoring System
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">Welcome back to NHPMS</p>
            </div>

            {/* useSearchParams must be in a Suspense boundary */}
            <Suspense fallback={null}>
              <RegisteredBanner />
            </Suspense>

            <LoginForm />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ministry of Agriculture, Food Security and Natural Resources — Botswana
          </p>
        </div>
      </main>
    </div>
  )
}
