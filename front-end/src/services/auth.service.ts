import { apiClient } from "@/lib/axios";
import { LoginResponse } from "@/types/user";

export async function loginRequest(email: string, senha: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, senha });
  return data;
}
