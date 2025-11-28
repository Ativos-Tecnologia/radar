import { apiClient } from "@/lib/axios";
import type { Saldo } from "@/types/saldo";

export async function getSaldos(): Promise<Saldo[]> {
  const { data } = await apiClient.get<Saldo[]>("/saldos");
  return data;
}

export async function deleteSaldo(id: string): Promise<void> {
  await apiClient.delete(`/saldos/${id}`);
}
