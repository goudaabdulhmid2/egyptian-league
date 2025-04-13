import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction, RequestHandler } from "express";

import { BaseService } from "../services/baseService";
import logger from "../utils/logger";
import { QueryString } from "../utils/apiFeatures";
import { responseUtil } from "../utils/responseUtil";

/**
 * Factory function to create a base controller with standard CRUD operations
 * Uses dependency injection for better testability and loose coupling
 *
 * @param service The service to use for database operations
 * @param modelName The name of the model (for response formatting)
 */
const createBaseController = <T extends Record<string, any>>(
  service: BaseService<T>,
  modelName: string
) => {
  const controller = {
    getOne: asyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        logger.info(`Controller: Getting ${modelName} by id`, {
          id,
          modelName,
        });

        const doc = await service.getOne(id);
        responseUtil.sendSuccess(res, {
          [modelName]: doc,
        });
      }
    ),
    getAll: asyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        logger.info(`Controller: Getting all ${modelName}s`, {
          query: req.query,
          modelName,
        });

        const queryString: QueryString = req.query as QueryString;
        const result = await service.getAll(queryString);

        responseUtil.sendSuccessWithPagination(
          res,
          {
            [modelName]: result.data,
          },
          result.pagination
        );
      }
    ),

    createOne: asyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        logger.info(`controller: Creating new ${modelName}`, {
          modelName,
          data: req.body,
        });

        const doc = await service.createOne(req.body);

        responseUtil.sendCreated(res, {
          [modelName]: doc,
        });
      }
    ),

    updateOne: asyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        logger.info(`Controller: Updating ${modelName}`, {
          id,
          modelName,
          data: req.body,
        });

        const doc = await service.updateOne(id, req.body);

        responseUtil.sendSuccess(res, {
          [modelName]: doc,
        });
      }
    ),
    deleteOne: asyncHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        logger.info(`Controller: Deleting ${modelName}`, { id, modelName });

        await service.deleteOne(id);

        responseUtil.sendNoContent(res);
      }
    ),
  };

  return controller;
};

export default createBaseController;
