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

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  if (isRefreshing) {
    if (refreshPromise) {
      return refreshPromise;
    }
    return Promise.reject(new Error('Already refreshing'));
  }

  isRefreshing = true;
  refreshPromise = fetch('/api/auth/refresh', {
    method: 'POST',
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Refresh failed');
      }
    })
    .catch((error) => {
      console.error('Token refresh error:', error);
      window.location.href = '/login';
      throw error;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
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

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 401) {
      await refreshAccessToken();
      
      const newResponse = await fetch(url, options);
      return handleResponse<T>(newResponse);
    }
    
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error instanceof Error ? error.message : 'Request failed');
  }
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
  return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  });
}

export async function getWithAuth<T>(endpoint: string): Promise<T> {
  return fetchWithRetry<T>(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    credentials: 'include',
    headers: {},
  });
}

export interface AuditLogQueryParams {
  page?: number
  page_size?: number
  username?: string
  action?: string
  method?: string
  status_code?: number
  start_date?: string
  end_date?: string
}

export async function getAuditLogs(params?: AuditLogQueryParams): Promise<any> {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.page_size) searchParams.append('page_size', params.page_size.toString());
  if (params?.username) searchParams.append('username', params.username);
  if (params?.action) searchParams.append('action', params.action);
  if (params?.method) searchParams.append('method', params.method);
  if (params?.status_code) searchParams.append('status_code', params.status_code.toString());
  if (params?.start_date) searchParams.append('start_date', params.start_date);
  if (params?.end_date) searchParams.append('end_date', params.end_date);

  const endpoint = `/audit-logs${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  return getWithAuth(endpoint);
}

export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Logout failed')
  }
  
  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Logout failed')
  }
}
