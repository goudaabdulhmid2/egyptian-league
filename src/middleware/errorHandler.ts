import { Request, Response, NextFunction } from "express";

import ApiError from "../utils/apiError";
import { Prisma } from "@prisma/client";

const handleNonApiError = (err: Error): ApiError => {
  // Handel Prisma-specific errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      return new ApiError(
        "Record not found",
        404,
        "fail",
        true,
        "RECORD_NOT_FOUND"
      );
    }
    return new ApiError(
      "Database error",
      500,
      "error",
      false,
      "DATABASE_ERROR"
    );
  }
  return new ApiError(
    err.message || "Something went wrong",
    500,
    "error",
    false
  );
};
const sendErrorDev = (err: ApiError, res: Response) => {
  console.error("Error (DEV) ", err);

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    timestamp: err.timestamp,
    errorCode: err.errorCode,
    details: err.details,
  });
};

const sendErrorProd = (err: ApiError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      timestamp: err.timestamp,
      errorCode: err.errorCode,
      details: err.details,
    });
  } else {
    // Programming or unknown errors
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      timestamp: err.timestamp || new Date(),
    });
  }
};

export default (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiError = err instanceof ApiError ? err : handleNonApiError(err);

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(apiError, res);
  } else {
    sendErrorProd(apiError, res);
  }
};
