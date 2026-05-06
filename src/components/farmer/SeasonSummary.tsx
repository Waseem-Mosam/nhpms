// components/farmer/SeasonSummary.tsx
// Displays a farmer's current-season KPI cards:
//   - Total hectares planted
//   - Total expected yield (tonnes)
//   - Active plots count
//   - Harvested plots count
//
// Accepts pre-fetched data as props (rendered server-side on the dashboard page).

import type { FarmerSeasonSummary } from '@/types'
import { Sprout, TrendingUp, BarChart2, CheckCircle2 } from 'lucide-react'

type Props = {
  summary: FarmerSeasonSummary | null
}

type KPICardProps = {
  label: string
  value: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

function KPICard({ label, value, icon: Icon, iconBg, iconColor }: KPICardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold leading-tight text-foreground">{value}</p>
      </div>
    </div>
  )
}

export default function SeasonSummary({ summary }: Props) {
  const totalHa = summary ? summary.total_area_ha.toFixed(2) : '0.00'
  const totalYield = summary ? summary.total_expected_yield_tonnes.toFixed(1) : '0.0'
  const activePlots = summary ? summary.active_plots : 0
  const harvestedPlots = summary ? summary.harvested_plots : 0

  return (
    <section aria-label="This season summary">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground md:text-base">This Season</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPICard
          label="Total Hectares"
          value={`${totalHa} ha`}
          icon={Sprout}
          iconBg="bg-secondary"
          iconColor="text-primary"
        />
        <KPICard
          label="Expected Yield"
          value={`${totalYield} tons`}
          icon={TrendingUp}
          iconBg="bg-secondary"
          iconColor="text-primary"
        />
        <KPICard
          label="Active Plots"
          value={String(activePlots)}
          icon={BarChart2}
          iconBg="bg-secondary"
          iconColor="text-primary"
        />
        <KPICard
          label="Harvested"
          value={String(harvestedPlots)}
          icon={CheckCircle2}
          iconBg="bg-[var(--status-harvested-bg)]"
          iconColor="text-[var(--status-harvested)]"
        />
      </div>
    </section>
  )
}
