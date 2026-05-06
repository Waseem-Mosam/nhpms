// app/(farmer)/learn/page.tsx
// Learn — placeholder page for the MVP.
// Out of scope for this phase but referenced in the bottom nav.

export const metadata = {
  title: 'Learn — NHPMS',
}

export default function LearnPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary px-4 pb-5 pt-12">
        <h1 className="text-xl font-bold text-primary-foreground">Learn</h1>
        <p className="mt-0.5 text-sm text-primary-foreground/70">Agricultural resources</p>
      </header>

      <div className="-mt-2 flex flex-col items-center gap-4 rounded-t-2xl bg-background px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-4xl">
          📚
        </div>
        <p className="text-sm font-medium text-foreground">Coming Soon</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Extension resources, pest management guides, and training materials will be available here.
        </p>
      </div>
    </div>
  )
}
