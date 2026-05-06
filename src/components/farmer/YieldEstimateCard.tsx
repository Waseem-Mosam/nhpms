// components/farmer/YieldEstimateCard.tsx
// Displays a live yield preview while the farmer fills in the crop form.
// Shown below the form inputs once both area and production method are selected.

type Props = {
  estimatedYield: number | null
  harvestDate: string | null
  cropLabel: string
}

export default function YieldEstimateCard({ estimatedYield, harvestDate, cropLabel }: Props) {
  if (estimatedYield === null) return null

  const harvestFormatted = harvestDate
    ? new Date(harvestDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div className="rounded-xl bg-secondary border border-primary/20 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
        Yield Estimate
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-primary">
          {estimatedYield.toFixed(1)}
        </span>
        <span className="text-base font-medium text-muted-foreground">tonnes</span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Expected from your {cropLabel} plot
      </p>
      {harvestFormatted && (
        <p className="mt-2 text-xs text-muted-foreground">
          Estimated harvest: <span className="font-medium text-foreground">{harvestFormatted}</span>
        </p>
      )}
    </div>
  )
}
