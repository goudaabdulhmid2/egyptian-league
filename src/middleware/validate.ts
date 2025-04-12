import { Request, Response, NextFunction, RequestHandler } from "express";
import { ZodSchema, z } from "zod";
import { ParsedQs } from "qs";
import asyncHandler from "express-async-handler";

type RequestPart = "body" | "query" | "params";

interface ValidationConfig {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;

  // Optional configuration to only validate specific parts
  validateOnly?: RequestPart[];
}

/**
 * Middleware factory for validating request data against Zod schemas.
 * Supports validation for body, query, and params separately.
 *
 * @param config - Configuration object or a single Zod schema
 */

export const validate = (
  config: ValidationConfig | ZodSchema
): RequestHandler => {
  // If the config is a schema, assume it's for body validation
  const validationConfig: ValidationConfig =
    config instanceof ZodSchema ? { body: config } : config;

  const {
    body: bodySchema,
    query: querySchema,
    params: paramsSchema,
  } = validationConfig;

  const partsToValidate = validationConfig.validateOnly || [
    "body",
    "params",
    "query",
  ];

  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // Validate body if schema provided and part should be validated
      if (bodySchema && partsToValidate.includes("body") && req.body) {
        req.body = await bodySchema.parseAsync(req.body);
      }

      // Validate query if schema provided and part should be validated
      if (querySchema && partsToValidate.includes("query") && req.query) {
        req.query = (await querySchema.parseAsync(
          req.query
        )) as unknown as ParsedQs;
      }

      // Validate params if schema provided and part should be validated
      if (paramsSchema && partsToValidate.includes("params") && req.params) {
        req.params = await paramsSchema.parseAsync(req.params);
      }

      next();
    }
  );
};

/**
 * Convenience function to validate only the body
 */
export const validateBody = (schema: ZodSchema): RequestHandler =>
  validate({ body: schema, validateOnly: ["body"] });

/**
 * Convenience function to validate only the query params
 */
export const validateQuery = (schema: ZodSchema): RequestHandler =>
  validate({ query: schema, validateOnly: ["query"] });

/**
 * Convenience function to validate only the route params
 */
export const validateParams = (schema: ZodSchema): RequestHandler =>
  validate({ params: schema, validateOnly: ["params"] });
