"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/features/auth/lib/auth-client";
import { UserUsage } from "../types";

export function useUsage() {
  const { data: session } = useSession();

  const query = useQuery({
    queryKey: ["user-usage"],
    queryFn: async () => {
      return await apiClient<UserUsage>("/api/user/usage");
    },
    enabled: !!session?.user,
    staleTime: 1000 * 30, // 30 seconds
    retry: false,
  });

  const usage = query.data;
  const plan = usage?.plan ?? "FREE";
  const isPro = plan === "PRO" || plan === "PRO_PLUS";
  const isProPlus = plan === "PRO_PLUS";
  const isFree = plan === "FREE";

  return {
    usage,
    isPro,
    isProPlus,
    isFree,
    plan,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
