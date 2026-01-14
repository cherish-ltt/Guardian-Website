export interface AuditLog {
  id: string
  trace_id: string | null
  admin_id: string | null
  username: string | null
  action: string
  resource: string
  method: string
  params: Record<string, any> | null
  result: Record<string, any> | null
  status_code: number
  ip_address: string | null
  user_agent: string | null
  duration_ms: number
  created_at: string
}

export interface AuditLogsResponse {
  total: number
  page: number
  page_size: number
  list: AuditLog[]
}
