// lib/constants/crops.ts
// All crop-related constants used across the NHPMS application.
// These values are the single source of truth — do not hardcode them elsewhere.

import type { CropType, ProductionMethod } from '@/types'

/** Human-readable labels for display */
export const CROP_LABELS: Record<CropType, string> = {
  tomatoes: 'Tomatoes',
  cabbage: 'Cabbage',
  onions: 'Onions',
  watermelon: 'Watermelon',
  butternut: 'Butternut',
  spinach: 'Spinach',
  peppers: 'Peppers',
  carrots: 'Carrots',
  beetroot: 'Beetroot',
  lettuce: 'Lettuce',
  cucumber: 'Cucumber',
  sweet_corn: 'Sweet Corn',
}

/** All supported crop types as an ordered array */
export const CROP_TYPES: CropType[] = Object.keys(CROP_LABELS) as CropType[]

/** Human-readable labels for production methods */
export const PRODUCTION_METHOD_LABELS: Record<ProductionMethod, string> = {
  open_field: 'Open Field',
  shade_net: 'Shade Net',
  greenhouse: 'Greenhouse',
}

/**
 * Base yield in tonnes per hectare.
 * Source: Botswana Ministry of Agriculture field data (estimated for MVP).
 */
export const BASE_YIELD_T_PER_HA: Record<
  CropType,
  Record<ProductionMethod, number>
> = {
  tomatoes: { open_field: 25, shade_net: 35, greenhouse: 50 },
  cabbage: { open_field: 22, shade_net: 30, greenhouse: 40 },
  onions: { open_field: 20, shade_net: 28, greenhouse: 38 },
  watermelon: { open_field: 18, shade_net: 25, greenhouse: 32 },
  butternut: { open_field: 15, shade_net: 22, greenhouse: 30 },
  spinach: { open_field: 12, shade_net: 18, greenhouse: 25 },
  peppers: { open_field: 18, shade_net: 26, greenhouse: 38 },
  carrots: { open_field: 20, shade_net: 28, greenhouse: 36 },
  beetroot: { open_field: 18, shade_net: 24, greenhouse: 32 },
  lettuce: { open_field: 15, shade_net: 22, greenhouse: 30 },
  cucumber: { open_field: 22, shade_net: 32, greenhouse: 45 },
  sweet_corn: { open_field: 8, shade_net: 12, greenhouse: 16 },
}

/**
 * Days from planting to expected harvest for each crop type.
 * Used to calculate expected_harvest_date server-side.
 */
export const DAYS_TO_MATURITY: Record<CropType, number> = {
  tomatoes: 90,
  cabbage: 80,
  onions: 120,
  watermelon: 85,
  butternut: 100,
  spinach: 45,
  peppers: 90,
  carrots: 75,
  beetroot: 60,
  lettuce: 50,
  cucumber: 55,
  sweet_corn: 75,
}
