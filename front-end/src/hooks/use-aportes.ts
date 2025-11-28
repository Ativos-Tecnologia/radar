"use client";

import { useQuery } from "@tanstack/react-query";
import type { Aporte } from "@/types/aporte";
import { getAportes } from "@/services/aportes.service";

export interface UseAportesParams {
  enteId?: string;
  ano?: number;
}

export function useAportesQuery(params: UseAportesParams) {
  return useQuery<Aporte[]>({
    queryKey: ["aportes", params],
    queryFn: () => getAportes(params.enteId, params.ano),
  });
}
