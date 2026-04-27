-- Schema for NHPMS Project
-- Generated on 2026-04-24

-- Profiles Table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    full_name text NOT NULL,
    national_id text UNIQUE,
    role text NOT NULL DEFAULT 'farmer'::text CHECK (role = ANY (ARRAY['farmer'::text, 'officer'::text, 'admin'::text])),
    district text,
    phone text,
    email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Crop Submissions Table
CREATE TABLE public.crop_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id uuid NOT NULL REFERENCES public.profiles(id),
    crop_type text NOT NULL CHECK (crop_type = ANY (ARRAY['tomatoes'::text, 'cabbage'::text, 'onions'::text, 'watermelon'::text, 'butternut'::text, 'spinach'::text, 'peppers'::text, 'carrots'::text, 'beetroot'::text, 'lettuce'::text, 'cucumber'::text, 'sweet_corn'::text])),
    area_ha numeric NOT NULL CHECK (area_ha >= 0.1),
    planting_date date NOT NULL,
    expected_harvest_date date,
    production_method text NOT NULL CHECK (production_method = ANY (ARRAY['open_field'::text, 'shade_net'::text, 'greenhouse'::text])),
    district text NOT NULL,
    location_description text,
    estimated_yield_tonnes numeric NOT NULL CHECK (estimated_yield_tonnes >= 0::numeric),
    harvest_status text NOT NULL DEFAULT 'growing'::text CHECK (harvest_status = ANY (ARRAY['growing'::text, 'harvested'::text, 'failed'::text])),
    actual_yield_tonnes numeric CHECK (actual_yield_tonnes >= 0::numeric),
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Crop Demand Baselines Table
CREATE TABLE public.crop_demand_baselines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    crop_type text NOT NULL UNIQUE CHECK (crop_type = ANY (ARRAY['tomatoes'::text, 'cabbage'::text, 'onions'::text, 'watermelon'::text, 'butternut'::text, 'spinach'::text, 'peppers'::text, 'carrots'::text, 'beetroot'::text, 'lettuce'::text, 'cucumber'::text, 'sweet_corn'::text])),
    annual_demand_tonnes numeric NOT NULL CHECK (annual_demand_tonnes > 0::numeric),
    data_source text,
    reference_year smallint NOT NULL DEFAULT (EXTRACT(year FROM now()))::smallint,
    updated_at timestamptz DEFAULT now()
);

-- Border Policy Log Table
CREATE TABLE public.border_policy_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id uuid NOT NULL REFERENCES public.profiles(id),
    crop_type text NOT NULL,
    projected_supply_tonnes numeric NOT NULL,
    national_demand_tonnes numeric NOT NULL,
    supply_ratio_pct numeric NOT NULL,
    system_recommendation text NOT NULL CHECK (system_recommendation = ANY (ARRAY['RESTRICT_IMPORTS'::text, 'MONITOR_SUPPLY'::text, 'OPEN_BORDERS'::text])),
    officer_decision text NOT NULL CHECK (officer_decision = ANY (ARRAY['RESTRICT_IMPORTS'::text, 'MONITOR_SUPPLY'::text, 'OPEN_BORDERS'::text])),
    justification text NOT NULL,
    is_override boolean GENERATED ALWAYS AS (system_recommendation <> officer_decision) STORED,
    logged_at timestamptz DEFAULT now()
);

-- Notifications Table
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id uuid REFERENCES public.profiles(id),
    target_role text CHECK (target_role = ANY (ARRAY['farmer'::text, 'officer'::text, 'admin'::text])),
    type text NOT NULL CHECK (type = ANY (ARRAY['market_alert'::text, 'surplus_alert'::text, 'shortage_alert'::text, 'advisory'::text, 'training'::text, 'system'::text])),
    title text NOT NULL,
    body text NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    related_crop_type text,
    severity text NOT NULL DEFAULT 'info'::text CHECK (severity = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text])),
    created_at timestamptz DEFAULT now()
);

-- RLS is enabled on all tables. Policies should be defined separately.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_demand_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.border_policy_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
