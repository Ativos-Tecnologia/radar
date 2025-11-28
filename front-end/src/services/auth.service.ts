import { apiClient } from "@/lib/axios";

interface LoginResponse {
  access_token: string;
  user: any;
}

export async function loginRequest(email: string, senha: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, senha });
  return data;
}
