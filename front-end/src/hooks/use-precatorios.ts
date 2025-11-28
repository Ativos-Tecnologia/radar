"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Precatorio } from "@/types/precatorio";
import { getPrecatorios, deletePrecatorio } from "@/services/precatorios.service";

const PRECATORIOS_QUERY_KEY = ["precatorios"] as const;

export function usePrecatoriosQuery() {
  return useQuery<Precatorio[]>({
    queryKey: PRECATORIOS_QUERY_KEY,
    queryFn: getPrecatorios,
  });
}

export function useDeletePrecatorioMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePrecatorio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRECATORIOS_QUERY_KEY });
    },
  });
}
