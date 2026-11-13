"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useSession } from "@/features/auth/lib/auth-client";
import { CreditBalance } from "../types";

export function useCredits() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-credits"],
    queryFn: async () => {
      return await apiClient<CreditBalance>("/api/user/credits");
    },
    enabled: !!session?.user,
    staleTime: 1000 * 15, // 15 seconds
    refetchOnWindowFocus: true,
  });

  const credits = query.data?.credits ?? 0;
  const history = query.data?.history ?? [];

  const hasEnoughCredits = (cost: number) => credits >= cost;

  const invalidateCredits = () => {
    queryClient.invalidateQueries({ queryKey: ["user-credits"] });
    queryClient.invalidateQueries({ queryKey: ["user-usage"] });
  };

  return {
    credits,
    history,
    hasEnoughCredits,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    invalidateCredits,
  };
}

