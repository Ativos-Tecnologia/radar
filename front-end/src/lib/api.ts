const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, senha: string) =>
      apiRequest<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      }),
  },
  users: {
    list: () => apiRequest<any[]>('/users'),
    get: (id: string) => apiRequest<any>(`/users/${id}`),
    create: (data: any) => apiRequest<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
  },
  updateUser: (id: string, data: any) => apiRequest<any>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  changePassword: (id: string, data: { senhaAtual: string; novaSenha: string }) =>
    apiRequest<any>(`/users/${id}/change-password`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  entes: {
    getAll: () => apiRequest<any[]>('/entes'),
    get: (id: string) => apiRequest<any>(`/entes/${id}`),
    create: (data: any) => apiRequest<any>('/entes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/entes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<void>(`/entes/${id}`, {
      method: 'DELETE',
    }),
  },
  tribunais: {
    getAll: () => apiRequest<any[]>('/tribunais'),
    get: (id: string) => apiRequest<any>(`/tribunais/${id}`),
    create: (data: any) => apiRequest<any>('/tribunais', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/tribunais/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<void>(`/tribunais/${id}`, {
      method: 'DELETE',
    }),
  },
  rcl: {
    getAll: () => apiRequest<any[]>('/rcl'),
    get: (id: string) => apiRequest<any>(`/rcl/${id}`),
    create: (data: any) => apiRequest<any>('/rcl', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/rcl/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<void>(`/rcl/${id}`, {
      method: 'DELETE',
    }),
  },
};
