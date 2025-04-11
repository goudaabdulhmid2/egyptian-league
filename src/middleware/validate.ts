import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError";
import { AppErrorCode } from "../types/errorTypes";

export const validate = (schema: AnyZodObject) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Only validate the parts that exist in the schema
        const dataToValidate = {};
        if (schema.shape?.body) (dataToValidate as any).body = req.body;
        if (schema.shape?.query) (dataToValidate as any).query = req.query;
        if (schema.shape?.params) (dataToValidate as any).params = req.params;

        const validatedData = await schema.parseAsync(dataToValidate);

        // Update request with validated data
        if (validatedData.body) req.body = validatedData.body;
        if (validatedData.query) req.query = validatedData.query;
        if (validatedData.params) req.params = validatedData.params;

        next();
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ApiError(
            "Validation failed",
            400,
            "fail",
            true,
            AppErrorCode.VALIDATION_ERROR,
            {
              errors: error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
                code: err.code,
              })),
            }
          );
        }
        throw error;
      }
    }
  );
};
