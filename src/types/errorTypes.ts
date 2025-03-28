import { ZodError } from "zod";

import ApiError from "../utils/apiError";

export enum PrismaErrorCode {
  NOT_FOUND = "P2025",
  UNIQUE_CONSTRAINT = "P2002",
  FOREIGN_KEY = "P2003",
  VALUE_TOO_LONG = "P2000",
  VALUE_TOO_SHORT = "P2001",
  INVALID_VALUE = "P2004",
  INVALID_DATA_TYPE = "P2005",
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
  INVALID_DATA_TYPE = "INVALID_DATA_TYPE",
}

export interface ErrorResponse {
  status: string;
  message: string;
  timestamp: Date;
  errorCode?: string;
  details?: Record<string, any>;
  stack?: string;
  error?: ApiError | ZodError;
}

export interface PrismaErrorConfig {
  message: string | ((field: string) => string);
  statusCode: number;
  errorCode: AppErrorCode;
}
