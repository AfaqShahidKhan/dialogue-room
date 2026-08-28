"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Me } from "@dialogue-room/shared";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export function useMe() {
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery<Me, ApiError>({
    queryKey: ["me"],
    queryFn: () => api.get<{ user: Me }>("/users/me").then((data) => data.user),
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
    if (query.isError) {
      setUser(null);
    }
  }, [query.data, query.isError, setUser]);

  return query;
}
