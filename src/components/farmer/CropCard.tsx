'use client'

// components/farmer/CropCard.tsx
// A card showing summary information for a single crop submission.
// Used in the farmer dashboard (preview list) and the My Crops page (full list).

import type { CropSubmission } from '@/types'
import { CROP_LABELS, PRODUCTION_METHOD_LABELS } from '@/lib/constants/crops'
import { Calendar, Layers, MapPin } from 'lucide-react'

// Emoji icons for each crop type — gives the mobile UI a friendly feel
const CROP_EMOJI: Record<string, string> = {
  tomatoes: '🍅',
  cabbage: '🥬',
  onions: '🧅',
  watermelon: '🍉',
  butternut: '🎃',
  spinach: '🌿',
  peppers: '🫑',
  carrots: '🥕',
  beetroot: '🟣',
  lettuce: '🥗',
  cucumber: '🥒',
  sweet_corn: '🌽',
}

type StatusConfig = {
  label: string
  className: string
}

function getStatusConfig(status: CropSubmission['harvest_status']): StatusConfig {
  switch (status) {
    case 'growing':
      return { label: 'Growing', className: 'bg-[var(--status-growing-bg)] text-[var(--status-growing)]' }
    case 'harvested':
      return { label: 'Harvested', className: 'bg-[var(--status-harvested-bg)] text-[var(--status-harvested)]' }
    case 'failed':
      return { label: 'Failed', className: 'bg-[var(--status-failed-bg)] text-[var(--status-failed)]' }
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

type Props = {
  crop: CropSubmission
}

export default function CropCard({ crop }: Props) {
  const status = getStatusConfig(crop.harvest_status)
  const emoji = CROP_EMOJI[crop.crop_type] ?? '🌱'
  const cropLabel = CROP_LABELS[crop.crop_type]
  const methodLabel = PRODUCTION_METHOD_LABELS[crop.production_method]

  return (
    <article className="rounded-xl bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* Crop emoji badge */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-2xl">
          {emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground leading-tight">{cropLabel}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
          </div>

          <p className="mt-0.5 text-sm text-muted-foreground font-medium">
            {crop.area_ha.toFixed(2)} ha &middot; Expected: {crop.estimated_yield_tonnes.toFixed(1)} tons
          </p>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Planted: {formatDate(crop.planting_date)}
            </span>
            {crop.expected_harvest_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Harvest: {formatDate(crop.expected_harvest_date)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {methodLabel}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {crop.district}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
