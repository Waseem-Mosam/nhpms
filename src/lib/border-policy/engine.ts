// lib/border-policy/engine.ts
// Pure function for generating border policy recommendations.
// This logic mirrors what is encoded in the v_national_supply_projection DB view,
// keeping the client and server in sync without duplication of magic numbers.

import type { PolicyRecommendation } from '@/types'

/**
 * Supply ratio thresholds for border policy recommendations.
 * Source: NHPMS implementation plan — Business Logic section.
 */
const RESTRICT_THRESHOLD = 1.1  // supply ≥ 110% of demand → restrict imports
const MONITOR_THRESHOLD = 0.75  // supply ≥ 75% of demand  → monitor supply
// supply < 75% of demand → open borders

/**
 * Generates a border policy recommendation based on projected supply vs demand.
 *
 * Formula:
 *   supply_ratio = projected_supply_tonnes / annual_demand_tonnes
 *   ≥ 1.10 → RESTRICT_IMPORTS
 *   ≥ 0.75 → MONITOR_SUPPLY
 *   < 0.75 → OPEN_BORDERS
 *
 * @param projectedSupplyTonnes - Total projected supply from growing crop submissions
 * @param annualDemandTonnes - Annual national demand from crop_demand_baselines
 * @returns The policy recommendation
 * @throws If annualDemandTonnes is zero or negative (would indicate bad seed data)
 */
export function getRecommendation(
  projectedSupplyTonnes: number,
  annualDemandTonnes: number,
): PolicyRecommendation {
  if (annualDemandTonnes <= 0) {
    throw new Error(
      `Invalid annualDemandTonnes: ${annualDemandTonnes}. Must be positive.`,
    )
  }

  const supplyRatio = projectedSupplyTonnes / annualDemandTonnes

  if (supplyRatio >= RESTRICT_THRESHOLD) {
    return 'RESTRICT_IMPORTS'
  } else if (supplyRatio >= MONITOR_THRESHOLD) {
    return 'MONITOR_SUPPLY'
  } else {
    return 'OPEN_BORDERS'
  }
}

/**
 * Calculates the supply ratio percentage.
 * Convenience helper used in the officer dashboard display.
 *
 * @param projectedSupplyTonnes - Total projected supply
 * @param annualDemandTonnes - Annual national demand
 * @returns Supply ratio as a percentage (e.g. 85.5 for 85.5%)
 */
export function getSupplyRatioPct(
  projectedSupplyTonnes: number,
  annualDemandTonnes: number,
): number {
  if (annualDemandTonnes <= 0) return 0
  return Math.round((projectedSupplyTonnes / annualDemandTonnes) * 10000) / 100
}
