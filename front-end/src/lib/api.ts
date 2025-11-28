import { apiClient } from './axios';

// Funções de API usando apiClient (que agora usa cookies)
export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    // Esta função não é mais necessária, mas mantida para compatibilidade
    // Use apiClient diretamente ou os services/hooks
    throw new Error('Use apiClient from @/lib/axios or services/hooks instead');
}

export const api = {
    auth: {
        login: (email: string, senha: string) =>
            apiClient.post<{ user: any }>('/auth/login', { email, senha }).then(res => res.data),
    },
    users: {
        list: () => apiClient.get<any[]>('/users').then(res => res.data),
        get: (id: string) => apiClient.get<any>(`/users/${id}`).then(res => res.data),
        create: (data: any) => apiClient.post<any>('/users', data).then(res => res.data),
        update: (id: string, data: any) => apiClient.patch<any>(`/users/${id}`, data).then(res => res.data),
        delete: (id: string) => apiClient.delete<void>(`/users/${id}`).then(res => res.data),
    },
    updateUser: (id: string, data: any) => apiClient.patch<any>(`/users/${id}`, data).then(res => res.data),
    changePassword: (id: string, data: { senhaAtual: string; novaSenha: string }) =>
        apiClient.patch<any>(`/users/${id}/change-password`, data).then(res => res.data),
    entes: {
        getAll: () => apiClient.get<any[]>('/entes').then(res => res.data),
        get: (id: string) => apiClient.get<any>(`/entes/${id}`).then(res => res.data),
        create: (data: any) => apiClient.post<any>('/entes', data).then(res => res.data),
        update: (id: string, data: any) => apiClient.patch<any>(`/entes/${id}`, data).then(res => res.data),
        delete: (id: string) => apiClient.delete<void>(`/entes/${id}`).then(res => res.data),
    },
    tribunais: {
        getAll: () => apiClient.get<any[]>('/tribunais').then(res => res.data),
        get: (id: string) => apiClient.get<any>(`/tribunais/${id}`).then(res => res.data),
        create: (data: any) => apiClient.post<any>('/tribunais', data).then(res => res.data),
        update: (id: string, data: any) => apiClient.patch<any>(`/tribunais/${id}`, data).then(res => res.data),
        delete: (id: string) => apiClient.delete<void>(`/tribunais/${id}`).then(res => res.data),
    },
    rcl: {
        getAll: () => apiClient.get<any[]>('/rcl').then(res => res.data),
        get: (id: string) => apiClient.get<any>(`/rcl/${id}`).then(res => res.data),
        create: (data: any) => apiClient.post<any>('/rcl', data).then(res => res.data),
        update: (id: string, data: any) => apiClient.patch<any>(`/rcl/${id}`, data).then(res => res.data),
        delete: (id: string) => apiClient.delete<void>(`/rcl/${id}`).then(res => res.data),
    },
    precatorios: {
        getAll: () => apiClient.get<any[]>('/precatorios').then(res => res.data),
        get: (id: string) => apiClient.get<any>(`/precatorios/${id}`).then(res => res.data),
        create: (data: any) => apiClient.post<any>('/precatorios', data).then(res => res.data),
        update: (id: string, data: any) => apiClient.patch<any>(`/precatorios/${id}`, data).then(res => res.data),
        delete: (id: string) => apiClient.delete<void>(`/precatorios/${id}`).then(res => res.data),
        downloadTemplate: async () => {
            const response = await apiClient.get('/precatorios/import/template', {
                responseType: 'blob',
            });
            return response.data;
        },
        importFromExcel: async (file: File, clientId: string) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('clientId', clientId);

            const response = await apiClient.post('/precatorios/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
    },
    saldos: {
        getAll: () => apiClient.get<any[]>('/saldos').then(res => res.data),
        get: (id: string) => apiClient.get<any>(`/saldos/${id}`).then(res => res.data),
        create: (data: any) => apiClient.post<any>('/saldos', data).then(res => res.data),
        update: (id: string, data: any) => apiClient.patch<any>(`/saldos/${id}`, data).then(res => res.data),
        delete: (id: string) => apiClient.delete<void>(`/saldos/${id}`).then(res => res.data),
    },
    pagamentos: {
        getAll: () => apiClient.get<any[]>('/pagamentos').then(res => res.data),
        get: (id: string) => apiClient.get<any>(`/pagamentos/${id}`).then(res => res.data),
        create: (data: any) => apiClient.post<any>('/pagamentos', data).then(res => res.data),
        update: (id: string, data: any) => apiClient.patch<any>(`/pagamentos/${id}`, data).then(res => res.data),
        delete: (id: string) => apiClient.delete<void>(`/pagamentos/${id}`).then(res => res.data),
    },
    aportes: {
        getAll: (enteId?: string, ano?: number) => {
            const params = new URLSearchParams();
            if (enteId) params.append('enteId', enteId);
            if (ano) params.append('ano', ano.toString());
            const query = params.toString();
            return apiClient.get<any[]>(`/aportes${query ? `?${query}` : ''}`).then(res => res.data);
        },
        get: (id: string) => apiClient.get<any>(`/aportes/${id}`).then(res => res.data),
        getByEnte: (enteId: string) => apiClient.get<any>(`/aportes/ente/${enteId}`).then(res => res.data),
        create: (data: any) => apiClient.post<any>('/aportes', data).then(res => res.data),
        update: (id: string, data: any) => apiClient.patch<any>(`/aportes/${id}`, data).then(res => res.data),
        delete: (id: string) => apiClient.delete<void>(`/aportes/${id}`).then(res => res.data),
    },
};
