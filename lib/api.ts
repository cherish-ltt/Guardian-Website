import { API_BASE_URL } from './config';

export interface ApiResponse<T = any> {
  code: number;
  msg: string | null;
  data: T;
  timestamp?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
  two_fa_code?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface TwoFASetupResponse {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', token);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('refresh_token', token);
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    throw new ApiError(0, 'Invalid response format');
  }

  const json: ApiResponse<T> = await response.json();

  if (json.code !== 200) {
    throw new ApiError(json.code, json.msg || 'Request failed', json.data);
  }

  return json.data;
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return handleResponse<T>(response);
}

export async function post<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function postWithAuth<T>(endpoint: string, data?: any): Promise<T> {
  const token = getAccessToken();
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  });
}

export async function getWithAuth<T>(endpoint: string): Promise<T> {
  const token = getAccessToken();
  return apiRequest<T>(endpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}
