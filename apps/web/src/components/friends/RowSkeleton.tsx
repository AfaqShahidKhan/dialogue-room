export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="size-11 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="size-9 shrink-0 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function RowSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}
