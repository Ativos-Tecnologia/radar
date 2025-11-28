"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tribunal } from "@/types/tribunal";
import { deleteTribunal, getTribunais } from "@/services/tribunais.service";

const TRIBUNAIS_QUERY_KEY = ["tribunais"] as const;

export function useTribunaisQuery() {
  return useQuery<Tribunal[]>({
    queryKey: TRIBUNAIS_QUERY_KEY,
    queryFn: getTribunais,
  });
}

export function useDeleteTribunalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTribunal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRIBUNAIS_QUERY_KEY });
    },
  });
}
