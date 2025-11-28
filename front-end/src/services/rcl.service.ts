import { apiClient } from "@/lib/axios";
import type { RclItem } from "@/types/rcl";

export async function getRcl(): Promise<RclItem[]> {
  const { data } = await apiClient.get<RclItem[]>("/rcl");
  return data;
}

export async function deleteRcl(id: string): Promise<void> {
  await apiClient.delete(`/rcl/${id}`);
}
