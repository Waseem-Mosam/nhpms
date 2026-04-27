// lib/yield/calculator.ts
// Pure functions for yield estimation and harvest date calculation.
// These contain no side effects and are fully unit-testable in isolation.
// Business logic is defined in the implementation plan — do not change
// the yield table or maturity days without a corresponding plan update.

import { BASE_YIELD_T_PER_HA, DAYS_TO_MATURITY } from '@/lib/constants/crops'
import type { CropType, ProductionMethod } from '@/types'

/**
 * Estimates crop yield in tonnes.
 *
 * Formula: estimated_yield_tonnes = area_ha × base_yield_t_per_ha[crop][method]
 *
 * @param cropType - The type of crop being planted
 * @param productionMethod - The production method used
 * @param areaHa - Area under cultivation in hectares (must be ≥ 0.1)
 * @returns Estimated yield in tonnes, rounded to 2 decimal places
 */
export function estimateYield(
  cropType: CropType,
  productionMethod: ProductionMethod,
  areaHa: number,
): number {
  const baseYield = BASE_YIELD_T_PER_HA[cropType][productionMethod]
  const rawYield = areaHa * baseYield
  // Round to 2 decimal places to match DB NUMERIC(10,2)
  return Math.round(rawYield * 100) / 100
}

/**
 * Calculates the expected harvest date from a planting date.
 *
 * Formula: planting_date + DAYS_TO_MATURITY[crop_type]
 *
 * @param cropType - The type of crop being planted
 * @param plantingDate - The planting date as an ISO date string (YYYY-MM-DD)
 * @returns Expected harvest date as an ISO date string (YYYY-MM-DD)
 */
export function getHarvestDate(
  cropType: CropType,
  plantingDate: string,
): string {
  const days = DAYS_TO_MATURITY[cropType]
  const planting = new Date(plantingDate)
  // Date arithmetic: add days
  planting.setDate(planting.getDate() + days)
  // Return as YYYY-MM-DD for consistency with the DB date type
  return planting.toISOString().split('T')[0]
}
