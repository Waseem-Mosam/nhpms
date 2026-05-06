// app/(farmer)/crops/add/page.tsx
// Add Crop — thin server wrapper around the CropForm client component.

import Link from 'next/link'
import CropForm from '@/components/farmer/CropForm'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
  title: 'Add New Crop — NHPMS',
}

export default function AddCropPage() {
  return (
    <div className="flex flex-col min-h-screen md:min-h-0 px-4 py-6 md:px-0 md:py-0">
      {/* Header */}
      <header className="flex items-center gap-4 pb-6">
        <Link
          href="/crops"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-foreground hover:bg-secondary/40 transition-colors"
          aria-label="Back to My Crops"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Crop</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your crop details</p>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 md:max-w-2xl bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 md:p-6">
          <CropForm />
        </div>
      </div>
    </div>
  )
}
