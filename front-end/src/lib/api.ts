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
  precatorios: {
    getAll: () => apiRequest<any[]>('/precatorios'),
    get: (id: string) => apiRequest<any>(`/precatorios/${id}`),
    create: (data: any) => apiRequest<any>('/precatorios', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/precatorios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<void>(`/precatorios/${id}`, {
      method: 'DELETE',
    }),
    downloadTemplate: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/precatorios/import/template`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        throw new Error('Falha ao baixar template');
      }
      return response.blob();
    },
    importFromExcel: async (file: File, clientId: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', clientId);

      const response = await fetch(`${API_URL}/precatorios/import`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        throw new Error(error.message || 'Falha ao importar arquivo');
      }

      return response.json();
    },
  },
  saldos: {
    getAll: () => apiRequest<any[]>('/saldos'),
    get: (id: string) => apiRequest<any>(`/saldos/${id}`),
    create: (data: any) => apiRequest<any>('/saldos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/saldos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<void>(`/saldos/${id}`, {
      method: 'DELETE',
    }),
  },
  pagamentos: {
    getAll: () => apiRequest<any[]>('/pagamentos'),
    get: (id: string) => apiRequest<any>(`/pagamentos/${id}`),
    create: (data: any) => apiRequest<any>('/pagamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => apiRequest<any>(`/pagamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => apiRequest<void>(`/pagamentos/${id}`, {
      method: 'DELETE',
    }),
  },
};
