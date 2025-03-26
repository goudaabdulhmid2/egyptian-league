export enum PrismaErrorCode {
  NOT_FOUND = "P2025",
  UNIQUE_CONSTRAINT = "P2002",
  FOREIGN_KEY = "P2003",
  VALUE_TOO_LONG = "P2000",
  VALUE_TOO_SHORT = "P2001",
  INVALID_VALUE = "P2004",
}

export enum AppErrorCode {
  RECORD_NOT_FOUND = "RECORD_NOT_FOUND",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  FOREIGN_KEY_ERROR = "FOREIGN_KEY_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  INVALID_VALUE = "INVALID_VALUE",
  VALUE_TOO_LONG = "VALUE_TOO_LONG",
  VALUE_TOO_SHORT = "VALUE_TOO_SHORT",
}

export interface ErrorResponse {
  status: string;
  message: string;
  timestamp: Date;
  errorCode?: string;
  details?: unknown;
  stack?: string;
  error?: unknown;
}
