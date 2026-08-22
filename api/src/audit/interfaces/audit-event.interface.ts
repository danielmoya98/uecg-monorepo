export interface AuditEvent {
  userId: string | null;

  method: string;

  route: string;

  statusCode: number;

  ipAddress: string;

  userAgent: string;

  payload?: any;

  errorMsg?: string;

  timestamp: Date;
}
