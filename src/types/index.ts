// types/index.ts — All shared TypeScript types for NHPMS
// No `any` types — every data shape is explicitly defined here.

export type Role = 'farmer' | 'officer' | 'admin'

export type Profile = {
  id: string
  full_name: string
  national_id: string | null
  role: Role
  district: string | null
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export type CropType =
  | 'tomatoes'
  | 'cabbage'
  | 'onions'
  | 'watermelon'
  | 'butternut'
  | 'spinach'
  | 'peppers'
  | 'carrots'
  | 'beetroot'
  | 'lettuce'
  | 'cucumber'
  | 'sweet_corn'

export type ProductionMethod = 'open_field' | 'shade_net' | 'greenhouse'

export type HarvestStatus = 'growing' | 'harvested' | 'failed'

export type CropSubmission = {
  id: string
  farmer_id: string
  crop_type: CropType
  area_ha: number
  planting_date: string
  expected_harvest_date: string | null
  production_method: ProductionMethod
  district: string
  location_description: string | null
  estimated_yield_tonnes: number
  harvest_status: HarvestStatus
  actual_yield_tonnes: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type PolicyRecommendation =
  | 'RESTRICT_IMPORTS'
  | 'MONITOR_SUPPLY'
  | 'OPEN_BORDERS'

export type NationalSupplyProjection = {
  crop_type: CropType
  farmer_count: number
  total_area_ha: number
  projected_supply_tonnes: number
  national_demand_tonnes: number
  supply_ratio_pct: number
  system_recommendation: PolicyRecommendation
}

export type DistrictBreakdown = {
  district: string
  crop_type: CropType
  farmer_count: number
  total_area_ha: number
  projected_yield_tonnes: number
}

export type FarmerSeasonSummary = {
  farmer_id: string
  total_plots: number
  total_area_ha: number
  total_expected_yield_tonnes: number
  active_plots: number
  harvested_plots: number
}

export type BorderPolicyLogEntry = {
  id: string
  officer_id: string
  crop_type: string
  projected_supply_tonnes: number
  national_demand_tonnes: number
  supply_ratio_pct: number
  system_recommendation: PolicyRecommendation
  officer_decision: PolicyRecommendation
  justification: string
  is_override: boolean
  logged_at: string
}

export type NotificationType =
  | 'market_alert'
  | 'surplus_alert'
  | 'shortage_alert'
  | 'advisory'
  | 'training'
  | 'system'

export type Severity = 'info' | 'warning' | 'critical'

export type Notification = {
  id: string
  recipient_id: string | null
  target_role: Role | null
  type: NotificationType
  title: string
  body: string
  is_read: boolean
  related_crop_type: string | null
  severity: Severity
  created_at: string
}
