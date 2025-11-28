import { apiClient } from "@/lib/axios";
import type { Precatorio } from "@/types/precatorio";

export async function getPrecatorios(): Promise<Precatorio[]> {
  const { data } = await apiClient.get<Precatorio[]>("/precatorios");
  return data;
}

export async function deletePrecatorio(id: string): Promise<void> {
  await apiClient.delete(`/precatorios/${id}`);
}
