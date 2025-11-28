import { apiClient } from "@/lib/axios";
import type { Ente } from "@/types/ente";

export async function getEntes(): Promise<Ente[]> {
  const { data } = await apiClient.get<Ente[]>("/entes");
  return data;
}

export async function deleteEnte(id: string): Promise<void> {
  await apiClient.delete(`/entes/${id}`);
}
