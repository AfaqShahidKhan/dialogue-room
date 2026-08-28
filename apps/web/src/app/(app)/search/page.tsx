"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchFiltersCard, EMPTY_FILTERS, toDiscoveryFilters, type SearchFiltersState } from "@/components/search/SearchFilters";
import { UserCard } from "@/components/search/UserCard";
import { UserCardSkeletonGrid } from "@/components/search/UserCardSkeleton";
import { Pagination } from "@/components/search/Pagination";

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFiltersState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const { data, isLoading, isPlaceholderData } = useDiscovery(toDiscoveryFilters(filters, page));

  function handleFiltersChange(next: SearchFiltersState) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Find language learners
        </h1>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Discover people learning your language by country, language, age and more.
        </p>
      </div>

      <SearchFiltersCard value={filters} onChange={handleFiltersChange} />

      {isLoading ? (
        <UserCardSkeletonGrid />
      ) : !data || data.users.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" aria-hidden="true" />}
          title="No matches found"
          description="Try widening your filters or clearing them to see more people."
        />
      ) : (
        <div
          className={
            isPlaceholderData
              ? "opacity-60 transition-opacity duration-200"
              : "transition-opacity duration-200"
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.users.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        </div>
      )}

      {data && data.pages > 1 && (
        <Pagination page={data.page} pages={data.pages} onPageChange={setPage} />
      )}
    </div>
  );
}
