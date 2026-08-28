export function UserCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex items-center gap-3">
        <div className="size-12 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <div className="h-[19px] w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-[19px] w-28 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-auto pt-1">
        <div className="h-9 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export function UserCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  );
}
