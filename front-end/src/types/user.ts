export enum UserRole {
    ADMIN = 'ADMIN',
    OPERADOR = 'OPERADOR',
    VISUALIZADOR = 'VISUALIZADOR'
}

export interface User {
    id: string;
    nomeCompleto: string;
    email: string;
    role: UserRole;
    departamento?: string;
    fotoUrl?: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}
