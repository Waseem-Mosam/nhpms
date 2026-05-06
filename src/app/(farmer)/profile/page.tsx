// app/(farmer)/profile/page.tsx
// Profile — display-only for MVP.
// Shows the farmer's registered information from the profiles table.
// Server Component: fetches profile server-side.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
import { User, MapPin, Phone, Mail, IdCard, Calendar } from 'lucide-react'

export const metadata = {
  title: 'My Profile — NHPMS',
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-border last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value ?? '—'}</p>
      </div>
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login')
  }

  const p = profile as Profile

  const initials = p.full_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex flex-col min-h-screen md:min-h-0 md:max-w-3xl">
      {/* Header */}
      <header className="bg-primary px-4 pb-8 pt-12 text-center md:bg-transparent md:text-left md:pb-6 md:pt-0">
        <div className="md:flex md:items-center md:gap-6">
          {/* Avatar */}
          <div className="mx-auto mb-3 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-3xl font-bold text-primary md:mx-0 md:mb-0 md:h-24 md:w-24 md:bg-primary/10">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground md:text-3xl md:text-foreground">{p.full_name}</h1>
            <span className="mt-1 inline-block rounded-full bg-primary-foreground/20 px-3 py-0.5 text-xs font-medium text-primary-foreground capitalize md:bg-primary/10 md:text-primary md:mt-2">
              {p.role}
            </span>
          </div>
        </div>
      </header>

      {/* Profile info card */}
      <div className="-mt-4 mx-4 flex flex-col rounded-2xl bg-card px-4 pt-1 pb-2 shadow-sm border border-border md:mt-0 md:mx-0 md:p-6">
        <ProfileRow icon={User} label="Full Name" value={p.full_name} />
        <ProfileRow icon={Mail} label="Email Address" value={p.email} />
        <ProfileRow icon={Phone} label="Phone Number" value={p.phone} />
        <ProfileRow icon={MapPin} label="District" value={p.district} />
        <ProfileRow icon={IdCard} label="National ID" value={p.national_id} />
        <ProfileRow icon={Calendar} label="Member Since" value={formatDate(p.created_at)} />
      </div>

      {/* Informational note */}
      <div className="mx-4 mt-4 rounded-xl bg-secondary px-4 py-3 border border-border md:mx-0 md:bg-card">
        <p className="text-xs text-muted-foreground leading-relaxed">
          To update your profile information, please contact your local agricultural extension officer.
        </p>
      </div>
    </div>
  )
}
