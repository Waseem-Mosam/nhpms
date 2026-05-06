// app/api/crops/route.ts
// POST /api/crops  — Submit a new crop planting
// GET  /api/crops  — Fetch the authenticated farmer's crop submissions
//
// POST validates input with Zod, calculates yield and harvest date
// using pure functions, then inserts into crop_submissions.
// Never expose service role key; uses the SSR client with cookie auth.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { estimateYield, getHarvestDate } from '@/lib/yield/calculator'
import type { CropType, ProductionMethod } from '@/types'

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const CROP_TYPES = [
  'tomatoes', 'cabbage', 'onions', 'watermelon', 'butternut', 'spinach',
  'peppers', 'carrots', 'beetroot', 'lettuce', 'cucumber', 'sweet_corn',
] as const

const PRODUCTION_METHODS = ['open_field', 'shade_net', 'greenhouse'] as const

const CropSubmissionSchema = z.object({
  crop_type: z.enum(CROP_TYPES, { error: 'Invalid crop type.' }),
  area_ha: z.number({ error: 'Area must be a number.' }).min(0.1, { message: 'Area must be at least 0.1 ha.' }),
  planting_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Planting date must be YYYY-MM-DD format.'),
  production_method: z.enum(PRODUCTION_METHODS, { error: 'Invalid production method.' }),
  district: z.string().min(1, 'District is required.'),
  location_description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

// ─── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // 1. Authenticate
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  // 2. Parse and validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = CropSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => i.message).join(' ')
    return NextResponse.json({ error: messages }, { status: 422 })
  }

  const {
    crop_type,
    area_ha,
    planting_date,
    production_method,
    district,
    location_description,
    notes,
  } = parsed.data

  // 3. Calculate yield and harvest date (business logic — pure functions)
  const estimated_yield_tonnes = estimateYield(
    crop_type as CropType,
    production_method as ProductionMethod,
    area_ha,
  )
  const expected_harvest_date = getHarvestDate(crop_type as CropType, planting_date)

  // 4. Insert into Supabase
  const { data, error: insertError } = await supabase
    .from('crop_submissions')
    .insert({
      farmer_id: user.id,
      crop_type,
      area_ha,
      planting_date,
      expected_harvest_date,
      production_method,
      district,
      location_description: location_description ?? null,
      estimated_yield_tonnes,
      notes: notes ?? null,
    })
    .select()
    .single()

  if (insertError) {
    console.error('[POST /api/crops] Supabase insert error:', insertError.message)
    return NextResponse.json(
      { error: 'Failed to save crop submission. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ data }, { status: 201 })
}

// ─── GET ───────────────────────────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('crop_submissions')
    .select('*')
    .eq('farmer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[GET /api/crops] Supabase fetch error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch crops.' }, { status: 500 })
  }

  return NextResponse.json({ data })
}
