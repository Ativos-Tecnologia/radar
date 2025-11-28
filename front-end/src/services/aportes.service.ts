import { apiClient } from "@/lib/axios";
import type { Aporte } from "@/types/aporte";

export async function getAportes(enteId?: string, ano?: number): Promise<Aporte[]> {
  const params = new URLSearchParams();
  if (enteId) params.append("enteId", enteId);
  if (ano) params.append("ano", String(ano));
  const query = params.toString();
  const { data } = await apiClient.get<Aporte[]>(`/aportes${query ? `?${query}` : ""}`);
  return data;
}
