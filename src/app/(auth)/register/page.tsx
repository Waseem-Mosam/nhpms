'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DISTRICTS } from '@/lib/constants/districts'
import type { Role } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react'

type FormError = {
  field?: string
  message: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<Role | ''>('')
  const [district, setDistrict] = useState('')
  const [phone, setPhone] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<FormError | null>(null)
  const [success, setSuccess] = useState(false)

  function validate(): FormError | null {
    if (!fullName.trim()) return { field: 'fullName', message: 'Full name is required.' }
    if (!email.trim()) return { field: 'email', message: 'Email address is required.' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { field: 'email', message: 'Enter a valid email address.' }
    if (password.length < 8) return { field: 'password', message: 'Password must be at least 8 characters.' }
    if (password !== confirmPassword) return { field: 'confirmPassword', message: 'Passwords do not match.' }
    if (!role) return { field: 'role', message: 'Please select your role.' }
    if (!district) return { field: 'district', message: 'Please select your district.' }
    if (!phone.trim()) return { field: 'phone', message: 'Phone number is required.' }
    return null
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    startTransition(async () => {
      const supabase = createClient()
      const { error: supabaseError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: role as Role,
            district,
            phone: phone.trim(),
            ...(role === 'farmer' && nationalId.trim() ? { national_id: nationalId.trim() } : {}),
          },
        },
      })

      if (supabaseError) {
        setError({ message: supabaseError.message })
        return
      }

      setSuccess(true)
      // Give the DB trigger a moment, then redirect to login
      setTimeout(() => router.push('/login?registered=true'), 1500)
    })
  }

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
          {/* Card */}
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Register to access the NHPMS portal
              </p>
            </div>

            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                Account created! Redirecting to login…
              </div>
            )}

            {error && !error.field && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Thabo Molefe"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  aria-invalid={error?.field === 'fullName'}
                  aria-describedby={error?.field === 'fullName' ? 'fullName-error' : undefined}
                />
                {error?.field === 'fullName' && (
                  <p id="fullName-error" className="text-xs text-destructive">{error.message}</p>
                )}
              </div>

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
                  aria-invalid={error?.field === 'email'}
                  aria-describedby={error?.field === 'email' ? 'email-error' : undefined}
                />
                {error?.field === 'email' && (
                  <p id="email-error" className="text-xs text-destructive">{error.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={error?.field === 'password'}
                    aria-describedby={error?.field === 'password' ? 'password-error' : undefined}
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
                {error?.field === 'password' && (
                  <p id="password-error" className="text-xs text-destructive">{error.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={error?.field === 'confirmPassword'}
                    aria-describedby={error?.field === 'confirmPassword' ? 'confirmPassword-error' : undefined}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {error?.field === 'confirmPassword' && (
                  <p id="confirmPassword-error" className="text-xs text-destructive">{error.message}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="role">I am a…</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as Role)}
                >
                  <SelectTrigger id="role" aria-invalid={error?.field === 'role'}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="officer">Agricultural Officer</SelectItem>
                  </SelectContent>
                </Select>
                {error?.field === 'role' && (
                  <p id="role-error" className="text-xs text-destructive">{error.message}</p>
                )}
              </div>

              {/* District */}
              <div className="space-y-1.5">
                <Label htmlFor="district">District</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger id="district" aria-invalid={error?.field === 'district'}>
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error?.field === 'district' && (
                  <p id="district-error" className="text-xs text-destructive">{error.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+267 71 234 567"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={error?.field === 'phone'}
                  aria-describedby={error?.field === 'phone' ? 'phone-error' : undefined}
                />
                {error?.field === 'phone' && (
                  <p id="phone-error" className="text-xs text-destructive">{error.message}</p>
                )}
              </div>

              {/* National ID — farmers only, optional */}
              {role === 'farmer' && (
                <div className="space-y-1.5">
                  <Label htmlFor="nationalId">
                    National ID (Omang){' '}
                    <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="nationalId"
                    type="text"
                    placeholder="123456789"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isPending || success}
                id="register-submit"
              >
                {isPending ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ministry of Agriculture, Food Security and Natural Resources — Botswana
          </p>
        </div>
      </main>
    </div>
  )
}
