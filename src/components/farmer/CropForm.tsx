'use client'

// components/farmer/CropForm.tsx
// The Add Crop form — Client Component so it can manage form state and show
// a live yield estimate as the farmer fills in values.
//
// On submit it POSTs to /api/crops. The API route validates, calculates
// yield & harvest date server-side, and inserts to Supabase.

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { CropType, ProductionMethod } from '@/types'
import {
  CROP_LABELS,
  CROP_TYPES,
  PRODUCTION_METHOD_LABELS,
} from '@/lib/constants/crops'
import { DISTRICTS } from '@/lib/constants/districts'
import { estimateYield, getHarvestDate } from '@/lib/yield/calculator'
import YieldEstimateCard from './YieldEstimateCard'
import { Loader2 } from 'lucide-react'

type FormData = {
  crop_type: CropType | ''
  area_ha: string
  planting_date: string
  production_method: ProductionMethod | ''
  district: string
  location_description: string
  notes: string
}

const INITIAL_FORM: FormData = {
  crop_type: '',
  area_ha: '',
  planting_date: '',
  production_method: '',
  district: '',
  location_description: '',
  notes: '',
}

const PRODUCTION_METHODS: ProductionMethod[] = ['open_field', 'shade_net', 'greenhouse']

export default function CropForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Live yield estimate — computed whenever relevant fields change
  const yieldPreview = useMemo(() => {
    if (!form.crop_type || !form.production_method || !form.area_ha) return null
    const area = parseFloat(form.area_ha)
    if (isNaN(area) || area < 0.1) return null
    return estimateYield(form.crop_type as CropType, form.production_method as ProductionMethod, area)
  }, [form.crop_type, form.production_method, form.area_ha])

  const harvestPreview = useMemo(() => {
    if (!form.crop_type || !form.planting_date) return null
    return getHarvestDate(form.crop_type as CropType, form.planting_date)
  }, [form.crop_type, form.planting_date])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleMethodSelect(method: ProductionMethod) {
    setForm((prev) => ({ ...prev, production_method: method }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    if (!form.crop_type || !form.production_method || !form.district) {
      setServerError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_type: form.crop_type,
          area_ha: parseFloat(form.area_ha),
          planting_date: form.planting_date,
          production_method: form.production_method,
          district: form.district,
          location_description: form.location_description || null,
          notes: form.notes || null,
        }),
      })

      const body = await res.json()

      if (!res.ok) {
        setServerError(body.error ?? 'Submission failed. Please try again.')
        return
      }

      // Success — navigate to My Crops
      router.push('/crops')
      router.refresh()
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 px-4 py-5">
      {/* Crop Type */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="crop_type" className="text-sm font-medium text-foreground">
          Crop Type <span className="text-destructive">*</span>
        </label>
        <select
          id="crop_type"
          name="crop_type"
          value={form.crop_type}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-input bg-card px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select crop</option>
          {CROP_TYPES.map((crop) => (
            <option key={crop} value={crop}>
              {CROP_LABELS[crop]}
            </option>
          ))}
        </select>
      </div>

      {/* Area Planted */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="area_ha" className="text-sm font-medium text-foreground">
          Area Planted (hectares) <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2 rounded-xl border border-input bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
          <input
            id="area_ha"
            name="area_ha"
            type="number"
            min="0.1"
            step="0.01"
            placeholder="0.00"
            value={form.area_ha}
            onChange={handleChange}
            required
            className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <span className="text-sm text-muted-foreground">ha</span>
        </div>
      </div>

      {/* Planting Date */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="planting_date" className="text-sm font-medium text-foreground">
          Planting Date <span className="text-destructive">*</span>
        </label>
        <input
          id="planting_date"
          name="planting_date"
          type="date"
          max={today}
          value={form.planting_date}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-input bg-card px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Production Method */}
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">
          Production Method <span className="text-destructive">*</span>
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PRODUCTION_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => handleMethodSelect(method)}
              className={`rounded-xl border py-2.5 text-xs font-medium transition-all ${
                form.production_method === method
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-input bg-card text-foreground hover:border-primary/50'
              }`}
            >
              {PRODUCTION_METHOD_LABELS[method]}
            </button>
          ))}
        </div>
      </div>

      {/* Live Yield Estimate */}
      {yieldPreview !== null && (
        <YieldEstimateCard
          estimatedYield={yieldPreview}
          harvestDate={harvestPreview}
          cropLabel={form.crop_type ? CROP_LABELS[form.crop_type as CropType] : ''}
        />
      )}

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="district" className="text-sm font-medium text-foreground">
          District <span className="text-destructive">*</span>
        </label>
        <select
          id="district"
          name="district"
          value={form.district}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-input bg-card px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Select district</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Location description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="location_description" className="text-sm font-medium text-foreground">
          Location Description <span className="text-muted-foreground text-xs font-normal">(optional)</span>
        </label>
        <input
          id="location_description"
          name="location_description"
          type="text"
          placeholder="e.g. Kanye, Kgatleng District"
          value={form.location_description}
          onChange={handleChange}
          className="w-full rounded-xl border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-foreground">
          Notes <span className="text-muted-foreground text-xs font-normal">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Any additional notes about this crop…"
          value={form.notes}
          onChange={handleChange}
          className="w-full resize-none rounded-xl border border-input bg-card px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Server error */}
      {serverError && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        id="submit-crop"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          'Submit'
        )}
      </button>

      <div className="h-2" />
    </form>
  )
}
