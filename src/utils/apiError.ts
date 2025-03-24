type ErrorStatus = "fail" | "error" | "forbidden" | "unauthorized";

class ApiError extends Error {
  public readonly statusCode: number;
  public readonly status: ErrorStatus;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly errorCode?: string; // Optional: for custom error codes
  public readonly details?: Record<string, any>; // Optional: for additional metadata

  constructor(
    message: string,
    statusCode: number,
    status: ErrorStatus,
    isOperational: boolean = true,
    errorCode?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export default ApiError;
