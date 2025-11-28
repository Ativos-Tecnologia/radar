import { apiClient } from "@/lib/axios";
import { Tribunal } from "@/types/tribunal";

export async function getTribunais(): Promise<Tribunal[]> {
  const { data } = await apiClient.get<Tribunal[]>("/tribunais");
  return data;
}

export async function deleteTribunal(id: string): Promise<void> {
  await apiClient.delete(`/tribunais/${id}`);
}
