import { apiClient } from "@/lib/axios";

export interface User {
  id: string;
  nomeCompleto: string;
  email: string;
  departamento?: string;
  role: "ADMIN" | "OPERADOR" | "VISUALIZADOR";
  ativo: boolean;
  createdAt: string;
}

export interface UserPayload {
  nomeCompleto: string;
  email: string;
  departamento?: string;
  senha?: string;
  role: "ADMIN" | "OPERADOR" | "VISUALIZADOR";
  ativo: boolean;
}

export async function listUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>("/users");
  return data;
}

export async function createUser(payload: UserPayload): Promise<User> {
  const { data } = await apiClient.post<User>("/users", payload);
  return data;
}

export async function updateUser(id: string, payload: UserPayload): Promise<User> {
  const { data } = await apiClient.patch<User>(`/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
