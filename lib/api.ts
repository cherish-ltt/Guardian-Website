import { API_BASE_URL } from './config';
import { API_ENDPOINTS } from './config';

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

export interface SystemInfo {
  id: string;
  cpu_count: number;
  cpu_total_load: number;
  memory_used: number;
  memory_total: number;
  disk_used: number;
  disk_total: number;
  network_upload: number;
  network_download: number;
  created_at: string;
}

export interface AdminInfo {
  id: string;
  username: string;
  is_super_admin: boolean;
  status: number;
  last_login_at?: string;
  created_at: string;
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

export function clearRefreshToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('refresh_token');
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

export async function putWithAuth<T>(endpoint: string, data?: any): Promise<T> {
  const token = getAccessToken();
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export async function deleteWithAuth<T>(endpoint: string): Promise<T> {
  const token = getAccessToken();
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

// 系统信息 API
export async function getSystemInfo(limit?: number): Promise<SystemInfo[]> {
  const query = limit ? `?limit=${limit}` : '';
  return getWithAuth<SystemInfo[]>(`${API_ENDPOINTS.SYSTEM_INFO}${query}`);
}

export async function changePassword(newPassword: string): Promise<ApiResponse<null>> {
  return postWithAuth(API_ENDPOINTS.CHANGE_PASSWORD, { new_password: newPassword });
}

export async function resetPassword(username: string, twoFaCode: string, newPassword: string): Promise<ApiResponse<null>> {
  return post(API_ENDPOINTS.RESET_PASSWORD, {
    username,
    two_fa_code: twoFaCode,
    new_password: newPassword,
  });
}

export async function getAdmins(params?: {
  page?: number;
  page_size?: number;
  status?: number;
  keyword?: string;
}): Promise<ApiResponse<{ total: number; page: number; page_size: number; list: AdminInfo[] }>> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', params.page.toString());
  if (params?.page_size) query.append('page_size', params.page_size.toString());
  if (params?.status !== undefined) query.append('status', params.status.toString());
  if (params?.keyword) query.append('keyword', params.keyword);

  const queryString = query.toString();
  const url = `${API_ENDPOINTS.ADMINS}${queryString ? `?${queryString}` : ''}`;
  return getWithAuth(url);
}

export async function createAdmin(data: {
  username: string;
  password: string;
  is_super_admin?: boolean;
  role_ids?: string[];
}): Promise<ApiResponse<AdminInfo>> {
  return postWithAuth(API_ENDPOINTS.ADMINS, data);
}

export async function updateAdmin(id: string, data: {
  password?: string;
  status?: number;
  role_ids?: string[];
}): Promise<ApiResponse<AdminInfo>> {
  return putWithAuth(`${API_ENDPOINTS.ADMINS}/${id}`, data);
}

export async function deleteAdmin(id: string): Promise<ApiResponse<null>> {
  return deleteWithAuth(`${API_ENDPOINTS.ADMINS}/${id}`);
}