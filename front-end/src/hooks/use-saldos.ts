"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Saldo } from "@/types/saldo";
import { getSaldos, deleteSaldo } from "@/services/saldos.service";

const SALDOS_QUERY_KEY = ["saldos"] as const;

export function useSaldosQuery() {
  return useQuery<Saldo[]>({
    queryKey: SALDOS_QUERY_KEY,
    queryFn: getSaldos,
  });
}

export function useDeleteSaldoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSaldo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALDOS_QUERY_KEY });
    },
  });
}
