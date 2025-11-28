import axios, { type InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enviar cookies automaticamente
});

// Remover interceptor de token - agora usa cookies
// O token é enviado automaticamente via cookies HttpOnly
