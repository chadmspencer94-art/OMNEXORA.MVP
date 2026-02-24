const SKELETON_WIDTHS = [72, 85, 64, 90, 78]

export function LoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl bg-slate-800/50 p-4">
          <div className="h-5 w-5 rounded-md bg-slate-700" />
          <div className="h-4 flex-1 rounded bg-slate-700" style={{ width: `${SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]}%` }} />
        </div>
      ))}
      <span className="sr-only">Loading todos...</span>
    </div>
  )
}
