import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";
import asyncHandler from "express-async-handler";

export const validate = (schema: AnyZodObject) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    }
  );
};
