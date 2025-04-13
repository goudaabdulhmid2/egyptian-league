import { Response } from "express";

import { PaginationResult } from "./apiFeatures";

export const responseUtil = {
  /**
   * Send a success response with status 200
   */
  sendSuccess: (
    res: Response,
    data: Record<string, any> | null = null,
    message: string = "success"
  ) => {
    return res.status(200).json({
      status: "success",
      message,
      data,
    });
  },

  /**
   * Send a success response with pagination info
   */

  sendSuccessWithPagination: (
    res: Response,
    data: Record<string, any> | null = null,
    pagination: PaginationResult,
    message: string = "success"
  ) => {
    return res.status(200).json({
      status: "success",
      message,
      reuslt: pagination?.total,
      pagination,
      data,
    });
  },

  /**
   * Send a created response with status 201
   */
  sendCreated: (
    res: Response,
    data: Record<string, any> | null = null,
    message: string = "Resource created successfully"
  ) => {
    return res.status(201).json({
      status: "success",
      message,
      data,
    });
  },

  /**
   * Send a no content response with status 204
   */
  sendNoContent: (res: Response) => {
    return res.status(204).send();
  },
};
