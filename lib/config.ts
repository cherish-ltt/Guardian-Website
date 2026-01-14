export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6123/guardian-auth/v1';

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  TWO_FACTOR_SETUP: '/auth/2fa/setup',
  TWO_FACTOR_VERIFY: '/auth/2fa/verify',
  TWO_FACTOR_DISABLE: '/auth/2fa/disable',
  ADMIN_CREATE: '/admins',
  AUDIT_LOGS: '/audit-logs',
} as const;
