export interface AuditLogUser {
  fullName: string;
  email: string;
}

export interface AuditLog {
  id: string;
  createdAt: string;
  method: string;
  route: string;
  statusCode: number;
  ipAddress: string | null;
  user: AuditLogUser | null;
}

export interface AuditMeta {
  total: number;
  totalPages: number;
}

export interface AuditResponse {
  data: AuditLog[];
  meta: AuditMeta;
}

export interface AuditQueryParams {
  page: number;
  limit: number;
  search?: string;
}
