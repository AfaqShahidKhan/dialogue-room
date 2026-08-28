import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { DiscoveredUser, Paginated } from "@dialogue-room/shared";
import { api } from "@/lib/api";

export interface DiscoveryFilters {
  q?: string;
  country?: string;
  gender?: string;
  minAge?: number;
  maxAge?: number;
  learningLanguage?: string;
  fluentLanguage?: string;
  page?: number;
  limit?: number;
}

export function useDiscovery(filters: DiscoveryFilters) {
  return useQuery<Paginated<DiscoveredUser>>({
    queryKey: ["users", filters],
    queryFn: () =>
      api.get<Paginated<DiscoveredUser>>("/users", {
        params: {
          q: filters.q || undefined,
          country: filters.country || undefined,
          gender: filters.gender || undefined,
          minAge: filters.minAge,
          maxAge: filters.maxAge,
          learningLanguage: filters.learningLanguage || undefined,
          fluentLanguage: filters.fluentLanguage || undefined,
          page: filters.page,
          limit: filters.limit,
        },
      }),
    placeholderData: keepPreviousData,
  });
}
