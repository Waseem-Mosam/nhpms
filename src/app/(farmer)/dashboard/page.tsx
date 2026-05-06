// app/(farmer)/dashboard/page.tsx
// Farmer dashboard — Server Component.
// Fetches season summary KPIs and the 3 most recent crop submissions server-side.
// No loading state needed at this level — Next.js Suspense handles it.

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { FarmerSeasonSummary, CropSubmission } from '@/types'
import SeasonSummary from '@/components/farmer/SeasonSummary'
import CropCard from '@/components/farmer/CropCard'
import { Bell, Plus } from 'lucide-react'

export const metadata = {
  title: 'My Dashboard — NHPMS Farmer Portal',
}

export default async function FarmerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch the farmer's profile (for greeting)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, district')
    .eq('id', user.id)
    .single()

  // Fetch season summary from the view
  const { data: summaryData } = await supabase
    .from('v_farmer_season_summary')
    .select('*')
    .eq('farmer_id', user.id)
    .single()

  const summary = summaryData as FarmerSeasonSummary | null

  // Fetch 3 most recent crops for the preview list
  const { data: recentCrops } = await supabase
    .from('crop_submissions')
    .select('*')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const crops = (recentCrops ?? []) as CropSubmission[]

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Farmer'
  const district = profile?.district ?? ''

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-0 md:py-0">
      {/* Desktop Header */}
      <header className="hidden md:flex items-start justify-between pb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hello, {firstName} 👋
          </h1>
          {district && (
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {district}
            </p>
          )}
        </div>
        <Link
          href="/notifications"
          className="flex items-center justify-center rounded-full bg-secondary/20 p-2 text-muted-foreground transition-colors hover:bg-secondary/40"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Link>
      </header>

      {/* Mobile Greeting (Hidden on desktop) */}
      <div className="md:hidden">
        <h1 className="text-xl font-bold text-foreground">
          Hello, {firstName} 👋
        </h1>
        {district && (
          <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {district}
          </p>
        )}
      </div>

      {/* Season KPIs */}
      <SeasonSummary summary={summary} />

      {/* Recent crops preview */}
      <section aria-label="My recent crops" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            My Crops
          </h2>
          <Link
            href="/crops"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {crops.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center bg-card">
            <p className="text-sm text-muted-foreground">No crops logged yet.</p>
            <Link
              href="/crops/add"
              className="text-sm font-medium text-primary hover:underline"
            >
              Log your first crop →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
            {crops.map((crop) => (
              <CropCard key={crop.id} crop={crop} />
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button (New Crop) for Mobile */}
      <Link
        href="/crops/add"
        className="fixed bottom-6 right-4 w-14 h-14 bg-primary text-primary-foreground shadow-lg rounded-full flex items-center justify-center hover:opacity-90 transition-opacity z-40 md:hidden"
        aria-label="Add Crop"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  )
}
