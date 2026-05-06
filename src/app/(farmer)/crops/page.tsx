'use client'

// app/(farmer)/crops/page.tsx
// My Crops — tabbed view (Active / Harvested / All).
// Client Component so we can manage tab state and filter locally.
// Data is fetched client-side via Supabase browser client on mount.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { CropSubmission } from '@/types'
import CropCard from '@/components/farmer/CropCard'
import { Plus, ChevronLeft, Loader2 } from 'lucide-react'

type Tab = 'active' | 'harvested' | 'all'

const TABS: { id: Tab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'harvested', label: 'Harvested' },
  { id: 'all', label: 'All' },
]

function filterCrops(crops: CropSubmission[], tab: Tab): CropSubmission[] {
  if (tab === 'active') return crops.filter((c) => c.harvest_status === 'growing')
  if (tab === 'harvested') return crops.filter((c) => c.harvest_status === 'harvested')
  return crops
}

export default function MyCropsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('active')
  const [crops, setCrops] = useState<CropSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCrops() {
      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError('Unable to load crops. Please log in again.')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('crop_submissions')
        .select('*')
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError('Failed to load crops. Please try again.')
      } else {
        setCrops((data ?? []) as CropSubmission[])
      }

      setLoading(false)
    }

    fetchCrops()
  }, [])

  const visibleCrops = filterCrops(crops, activeTab)

  return (
    <div className="flex flex-col min-h-screen md:min-h-0 px-4 py-6 md:px-0 md:py-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Crops</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage your crops</p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          {/* Tabs */}
          <div className="flex bg-secondary/20 p-1 rounded-xl w-full md:w-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 md:flex-none rounded-lg py-1.5 px-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop Add Crop */}
          <Link
            href="/crops/add"
            className="hidden md:flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add Crop
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col gap-4 flex-1">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && visibleCrops.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-card rounded-xl border border-border shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/20 text-4xl">
              🌱
            </div>
            <p className="text-sm font-medium text-foreground">No crops here yet</p>
            <p className="text-xs text-muted-foreground max-w-[250px]">
              {activeTab === 'harvested'
                ? 'You have not harvested any crops yet.'
                : 'Log your first crop to get started.'}
            </p>
          </div>
        )}

        {!loading && !error && visibleCrops.length > 0 && (
          <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
            {visibleCrops.map((crop) => (
              <CropCard key={crop.id} crop={crop} />
            ))}
          </div>
        )}

        {/* Need help card */}
        {!loading && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card p-4 md:max-w-md shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-xl">
              🧑‍🌾
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Need help?</p>
              <p className="text-xs text-muted-foreground">Contact your extension officer</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Add button - mobile only */}
      <Link
        href="/crops/add"
        className="fixed bottom-6 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden z-40"
        aria-label="Add new crop"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  )
}
