
---

# NHPMS MVP — Developer Briefing for LLM-Assisted Implementation

## Your Role

You are assisting a solo software engineer build an MVP (proof of concept) of the **National Horticulture Production Monitoring System (NHPMS)** for Botswana's Ministry of Agriculture. The purpose of this MVP is to demonstrate the core value proposition of the system in a ministry presentation — it is **not** a production system. You will help implement this feature by feature, file by file, as instructed.

**Always advise according to industry best practices.** If something the developer writes works but is not production-quality, flag it and explain why. Think step-by-step, consider tradeoffs, and never optimise for brevity at the expense of correctness.

---

## The Stack

| Concern | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Auth & Database | Supabase |
| Charts | Recharts |
| Hosting | Vercel |
| Version Control | GitHub |

**No other libraries should be introduced without discussing the tradeoff first.**

---

## What This MVP Must Demonstrate

There are three things the ministry presentation needs to show convincingly. Nothing outside this scope should be built.

**1. Farmer Portal** — A farmer can register, log a crop planting (type, hectares, planting date, production method, district/location), receive an automatic yield estimate on submission, and view their crop history with status tabs (Active / Harvested / All).

**2. Officer/Government Dashboard** — A government agricultural officer can see national and district-level intelligence: total farmers registered, total hectares under cultivation, total expected national yield, a top crops breakdown chart, and a district-by-district table.

**3. Border Policy Advisory** — The system automatically compares projected national supply against estimated national demand for each crop and generates a recommendation: `RESTRICT IMPORTS`, `MONITOR SUPPLY`, or `OPEN BORDERS`. An officer can view this recommendation, accept it or override it, and must provide a written justification. Every decision is logged immutably.

---

## What Is Explicitly Out of Scope for the MVP

Do not suggest, scaffold, or build any of the following — they belong to later phases:

- USSD integration
- SMS confirmation
- Botswana Met Services or BURS integration
- National ID (Omang) API verification
- AI/ML forecasting
- Audit trail UI (the data is logged in the DB but there is no UI page for it)
- Multilingual support (Setswana)
- Real geolocation / map API (the production map uses a static SVG)

---

## Database Schema

The schema is already created in Supabase. Do not regenerate it. Reference it when writing queries, types, and API routes.

### `public.profiles`
```
id              UUID  PK  (references auth.users)
full_name       TEXT  NOT NULL
national_id     TEXT  UNIQUE  NULLABLE
role            TEXT  CHECK ('farmer' | 'officer' | 'admin')  DEFAULT 'farmer'
district        TEXT  NULLABLE
phone           TEXT  NULLABLE
email           TEXT  NULLABLE
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### `public.crop_submissions`
```
id                      UUID  PK
farmer_id               UUID  FK → profiles.id  (RESTRICT on delete)
crop_type               TEXT  CHECK ('tomatoes'|'cabbage'|'onions'|'watermelon'|
                                     'butternut'|'spinach'|'peppers'|'carrots'|
                                     'beetroot'|'lettuce'|'cucumber'|'sweet_corn')
area_ha                 NUMERIC(8,2)   min 0.1
planting_date           DATE
expected_harvest_date   DATE  NULLABLE  (calculated server-side at submission)
production_method       TEXT  CHECK ('open_field'|'shade_net'|'greenhouse')
district                TEXT  NOT NULL  (denormalised — farmer may plant elsewhere)
location_description    TEXT  NULLABLE
estimated_yield_tonnes  NUMERIC(10,2)  (calculated server-side, stored for audit)
harvest_status          TEXT  CHECK ('growing'|'harvested'|'failed')  DEFAULT 'growing'
actual_yield_tonnes     NUMERIC(10,2)  NULLABLE
notes                   TEXT  NULLABLE
created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ
```

### `public.crop_demand_baselines`
```
id                    UUID  PK
crop_type             TEXT  UNIQUE
annual_demand_tonnes  NUMERIC(12,2)
data_source           TEXT
reference_year        SMALLINT
updated_at            TIMESTAMPTZ
```
Already seeded with demand figures for all 12 crop types.

### `public.border_policy_log`
```
id                      UUID  PK
officer_id              UUID  FK → profiles.id
crop_type               TEXT
projected_supply_tonnes NUMERIC(12,2)
national_demand_tonnes  NUMERIC(12,2)
supply_ratio_pct        NUMERIC(6,2)
system_recommendation   TEXT  CHECK ('RESTRICT_IMPORTS'|'MONITOR_SUPPLY'|'OPEN_BORDERS')
officer_decision        TEXT  CHECK ('RESTRICT_IMPORTS'|'MONITOR_SUPPLY'|'OPEN_BORDERS')
justification           TEXT  NOT NULL
is_override             BOOLEAN  GENERATED ALWAYS AS (system_recommendation != officer_decision) STORED
logged_at               TIMESTAMPTZ
```
Append-only. No UPDATE or DELETE.

### `public.notifications`
```
id            UUID  PK
recipient_id  UUID  FK → profiles.id  NULLABLE  (NULL = broadcast)
target_role   TEXT  NULLABLE  ('farmer'|'officer'|'admin')  used for broadcasts
type          TEXT  CHECK ('market_alert'|'surplus_alert'|'shortage_alert'|
                           'advisory'|'training'|'system')
title         TEXT
body          TEXT
is_read       BOOLEAN  DEFAULT false
related_crop_type  TEXT  NULLABLE
severity      TEXT  CHECK ('info'|'warning'|'critical')  DEFAULT 'info'
created_at    TIMESTAMPTZ
```
Constraint: `recipient_id IS NOT NULL OR target_role IS NOT NULL`.

### Database Views (already created — query these directly)
- `public.v_national_supply_projection` — aggregates growing crop_submissions per crop type, joins demand baseline, calculates supply_ratio_pct and system_recommendation
- `public.v_district_breakdown` — aggregates growing crops by district and crop type
- `public.v_farmer_season_summary` — per-farmer totals (total plots, area, expected yield, active vs harvested counts)

---

## Business Logic

### Yield Estimation

Calculated server-side in the API route at submission time. Never recalculated after storage.

```
estimated_yield_tonnes = area_ha × base_yield_t_per_ha[crop_type][production_method]
```

Base yield table (tonnes per hectare):

| Crop | Open Field | Shade Net | Greenhouse |
|---|---|---|---|
| tomatoes | 25 | 35 | 50 |
| cabbage | 22 | 30 | 40 |
| onions | 20 | 28 | 38 |
| watermelon | 18 | 25 | 32 |
| butternut | 15 | 22 | 30 |
| spinach | 12 | 18 | 25 |
| peppers | 18 | 26 | 38 |
| carrots | 20 | 28 | 36 |
| beetroot | 18 | 24 | 32 |
| lettuce | 15 | 22 | 30 |
| cucumber | 22 | 32 | 45 |
| sweet_corn | 8 | 12 | 16 |

### Expected Harvest Date

Calculated from planting date + crop maturity days:

| Crop | Days to Maturity |
|---|---|
| tomatoes | 90 |
| cabbage | 80 |
| onions | 120 |
| watermelon | 85 |
| butternut | 100 |
| spinach | 45 |
| peppers | 90 |
| carrots | 75 |
| beetroot | 60 |
| lettuce | 50 |
| cucumber | 55 |
| sweet_corn | 75 |

### Border Policy Recommendation Logic

```
supply_ratio = projected_supply_tonnes / annual_demand_tonnes

if supply_ratio >= 1.10  →  RESTRICT_IMPORTS
if supply_ratio >= 0.75  →  MONITOR_SUPPLY
if supply_ratio <  0.75  →  OPEN_BORDERS
```

This logic lives in `lib/border-policy/engine.ts` as a pure function and is also encoded in the `v_national_supply_projection` database view.

---

## Project File Structure

```
nhpms/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (farmer)/
│   │   ├── layout.tsx                  ← farmer shell with bottom nav
│   │   ├── dashboard/page.tsx          ← season summary KPIs + crop list
│   │   ├── crops/
│   │   │   ├── page.tsx                ← My Crops (Active/Harvested/All tabs)
│   │   │   └── add/page.tsx            ← Add Crop form
│   │   ├── notifications/page.tsx
│   │   └── profile/page.tsx
│   ├── (officer)/
│   │   ├── layout.tsx                  ← officer shell with sidebar nav
│   │   ├── dashboard/page.tsx          ← national KPIs + top crops chart + district table
│   │   ├── crops/page.tsx              ← per-crop drill-down analysis
│   │   ├── border-policy/page.tsx      ← advisory recommendations + officer decision form
│   │   ├── map/page.tsx                ← static SVG production map
│   │   └── reports/page.tsx            ← print/export situational report
│   ├── api/
│   │   ├── crops/route.ts              ← POST (submit crop), GET (farmer's crops)
│   │   └── border-policy/route.ts      ← POST (log officer decision)
│   ├── layout.tsx                      ← root layout
│   └── page.tsx                        ← redirect based on role
├── components/
│   ├── ui/                             ← shadcn auto-generated, do not edit
│   ├── farmer/
│   │   ├── CropCard.tsx
│   │   ├── CropForm.tsx
│   │   ├── YieldEstimateCard.tsx
│   │   └── SeasonSummary.tsx
│   ├── officer/
│   │   ├── KPICard.tsx
│   │   ├── CropBreakdownChart.tsx      ← Recharts donut chart
│   │   ├── DistrictTable.tsx
│   │   ├── BorderPolicyCard.tsx        ← recommendation + officer decision form
│   │   └── AlertFeed.tsx
│   └── shared/
│       ├── AppHeader.tsx
│       ├── BottomNav.tsx               ← mobile farmer nav
│       ├── SidebarNav.tsx              ← officer desktop nav
│       └── RoleGuard.tsx              ← wraps routes, checks role from profile
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   ← browser client (createBrowserClient)
│   │   └── server.ts                   ← server client (createServerClient + cookies)
│   ├── yield/
│   │   └── calculator.ts               ← pure functions: estimateYield, getHarvestDate
│   ├── border-policy/
│   │   └── engine.ts                   ← pure function: getRecommendation
│   └── constants/
│       ├── crops.ts                    ← crop list, base yields, maturity days
│       └── districts.ts               ← Botswana districts array
├── hooks/
│   ├── useUser.ts                      ← current user + profile
│   └── useCrops.ts                     ← farmer's crop submissions
├── types/
│   └── index.ts                        ← all shared TypeScript types
└── middleware.ts                        ← session refresh + role-based redirects
```

---

## TypeScript Types

Generate and use these types consistently across the entire codebase. Never use `any`.

```ts
// types/index.ts

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
  | 'tomatoes' | 'cabbage' | 'onions' | 'watermelon'
  | 'butternut' | 'spinach' | 'peppers' | 'carrots'
  | 'beetroot' | 'lettuce' | 'cucumber' | 'sweet_corn'

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

export type PolicyRecommendation = 'RESTRICT_IMPORTS' | 'MONITOR_SUPPLY' | 'OPEN_BORDERS'

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
  | 'market_alert' | 'surplus_alert' | 'shortage_alert'
  | 'advisory' | 'training' | 'system'

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
```

---

## Auth & Routing Rules

### Signup metadata contract
When calling `supabase.auth.signUp()`, always pass user data in `options.data`:
```ts
supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: string,
      role: 'farmer' | 'officer',
      district: string,
      phone: string,
      national_id?: string,   // farmers only, optional for MVP
    }
  }
})
```
The database trigger `handle_new_user` reads this metadata and creates the profile row automatically. Never insert into `profiles` directly from the application.

### Route protection rules
```
/login, /register         → public (redirect to dashboard if already logged in)
/(farmer)/*               → role must be 'farmer' or 'admin'
/(officer)/*              → role must be 'officer' or 'admin'
/                         → redirect: farmer → /dashboard, officer → /officer/dashboard
```
Route protection is enforced in two places:
1. `middleware.ts` — refreshes the session and redirects unauthenticated users to `/login`
2. `RoleGuard` component — reads the profile role and redirects if the role doesn't match the route group

### Supabase client pattern
- Server Components and API routes: use `createServerClient` from `lib/supabase/server.ts` with cookie handling
- Client Components: use `createBrowserClient` from `lib/supabase/client.ts`
- Never use the service role key on the client side

---

## Design Reference

### Colour palette (derive Tailwind config from these)
- **Primary green** (headers, buttons, active states): `#2D6A2D` or close equivalent
- **Light green** (backgrounds, badges): `#E8F5E9`
- **Accent green** (growing status badge): `#4CAF50`
- **Warning orange** (near harvest badge): `#FF9800`
- **Alert red** (surplus alert): `#F44336`
- **Background**: `#F5F5F0` (off-white, not pure white)
- **Card background**: `#FFFFFF`

### UI conventions from the designs
- Farmer portal is **mobile-first** with a bottom navigation bar (5 tabs: Home, My Crops, Learn, Messages, Profile). It should feel like a native mobile app.
- Officer dashboard is **desktop-first** with a left sidebar navigation.
- Crop status badges use colour-coded pills: green for Growing, orange for Near Harvest, grey for Planted/Pending.
- KPI cards on both dashboards show a large number with a label and a subtle icon.
- The officer dashboard top crops section uses a **donut chart** (Recharts `PieChart` with `innerRadius`).
- Harvest Timeline on the crop analysis screen uses a **bar chart** (Recharts `BarChart`).
- The production map is a **static SVG of Botswana's districts** coloured by yield density (no map API).

---

## Implementation Sequence

Work through this in order. Do not jump ahead. Each phase depends on the previous one being stable.

### Phase 1 — Foundation
1. Initialise Next.js project with App Router, TypeScript, Tailwind
2. Install and configure shadcn/ui
3. Configure Tailwind theme with the NHPMS colour palette
4. Set up Supabase environment variables
5. Create `lib/supabase/client.ts` and `lib/supabase/server.ts`
6. Write `middleware.ts` for session refresh and auth redirects
7. Create `types/index.ts` with all types above
8. Create `lib/constants/crops.ts` and `lib/constants/districts.ts`
9. Create `lib/yield/calculator.ts` (pure functions, fully unit testable)
10. Create `lib/border-policy/engine.ts` (pure function, fully unit testable)

### Phase 2 — Auth Pages
11. Build `/register` page — form with full name, email, password, role selector, district dropdown, phone
12. Build `/login` page
13. Build root `page.tsx` redirect logic based on role
14. Build `RoleGuard` component
15. Test full signup → profile created via trigger → redirect to correct dashboard

### Phase 3 — Farmer Portal
16. Build farmer layout with `BottomNav`
17. Build farmer dashboard — season KPIs from `v_farmer_season_summary`, crop list preview
18. Build My Crops page — tabbed view (Active/Harvested/All), `CropCard` component
19. Build Add Crop page — `CropForm` with all fields, live yield estimate preview, submission to API route
20. Build `api/crops/route.ts` — validates input, calculates yield and harvest date, inserts to Supabase
21. Build Notifications page — reads from `notifications` table filtered to the user
22. Build Profile page — display only for MVP

### Phase 4 — Officer Dashboard
23. Build officer layout with `SidebarNav`
24. Build officer dashboard — KPI cards from `v_national_supply_projection` aggregates, donut chart, district table
25. Build Crops analysis page — crop selector, per-crop stats, harvest timeline bar chart
26. Build Border Policy page — reads `v_national_supply_projection`, displays recommendation per crop, officer decision form, posts to `api/border-policy/route.ts`
27. Build `api/border-policy/route.ts` — validates officer role, inserts to `border_policy_log`
28. Build Map page — static SVG of Botswana districts, shaded by projected yield relative to demand
29. Build Reports page — printable view of national supply summary (browser print stylesheet is sufficient)

### Phase 5 — Demo Preparation
30. Seed realistic demo data (after auth users are created manually): multiple farmers, varied districts, varied crops, dates that produce interesting border policy recommendations
31. Audit mobile responsiveness of farmer portal
32. Add loading skeletons, empty states, and error boundaries to all pages
33. Final Vercel deployment check

---

## Code Quality Standards

These apply to every file, every time:

- **No `any` types.** Use the types defined in `types/index.ts` or derive new ones with `Pick`, `Omit`, or `Partial`.
- **Server-side data fetching in Server Components** for the officer dashboard (the data doesn't need to be real-time). Use `createServerClient` and `await` the Supabase query directly in the component.
- **Client Components only where interactivity is needed** — forms, charts, tabs. Mark them with `'use client'`.
- **API routes validate input before touching the database.** Use Zod for schema validation on all POST routes.
- **Never expose the Supabase service role key to the client.** Only use it in API routes or server-side code.
- **Error handling on every Supabase call.** Destructure `{ data, error }` and handle `error` explicitly — never assume success.
- **Meaningful loading and empty states.** A blank page or unhandled loading state is not acceptable for a ministry demo.
- **All business logic (yield calculation, border policy engine) must be pure functions** in `lib/` — no side effects, easy to test and explain to non-technical stakeholders.

---

## How to Work With Me

- Implement **one file or one feature at a time** unless I ask for multiple.
- Always show the **complete file** — no truncation, no "rest of the file stays the same".
- If you spot something in my existing code that is not production-quality, **flag it with an explanation** before proceeding — don't silently ignore it.
- If I ask for something that is out of MVP scope, remind me and ask if I want to proceed anyway.
- When writing Supabase queries, **always use the typed client** — never raw SQL strings in the application layer unless there is no alternative.