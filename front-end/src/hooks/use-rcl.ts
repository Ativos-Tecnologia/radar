"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RclItem } from "@/types/rcl";
import { getRcl, deleteRcl } from "@/services/rcl.service";

const RCL_QUERY_KEY = ["rcl"] as const;

export function useRclQuery() {
  return useQuery<RclItem[]>({
    queryKey: RCL_QUERY_KEY,
    queryFn: getRcl,
  });
}

export function useDeleteRclMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRcl(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RCL_QUERY_KEY });
    },
  });
}
