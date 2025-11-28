"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Ente } from "@/types/ente";
import { getEntes, deleteEnte } from "@/services/entes.service";

const ENTES_QUERY_KEY = ["entes"] as const;

export function useEntesQuery() {
  return useQuery<Ente[]>({
    queryKey: ENTES_QUERY_KEY,
    queryFn: getEntes,
  });
}

export function useDeleteEnteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEnte(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTES_QUERY_KEY });
    },
  });
}
