import prisma from "../config/db";
import ApiFeatures, { QueryString, ApiResult } from "../utils/apiFeatures";
import ApiError from "../utils/apiError";
import { AppErrorCode } from "../types/errorTypes";
import logger from "../utils/logger";
import { Prisma } from "@prisma/client";

type PrismaModelDelegate<T> = {
  findUnique: (args: {
    where: { id: string };
    include?: Record<string, boolean>;
  }) => Promise<T | null>;
  findMany: (args?: any) => Promise<T[]>;
  count: (args?: { where: any }) => Promise<number>;
  create: (args: { data: any }) => Promise<T>;
  update: (args: { where: { id: string }; data: any }) => Promise<T>;
  delete: (args: { where: { id: string } }) => Promise<T>;
};

export interface BaseService<T> {
  /**
   * Fetches a single record by ID.
   * @param id The ID of the record to fetch.
   * @param include Optional relations to include in the result.
   * @throws {ApiError} If the record is not found.
   */
  getOne: (id: string, include?: Record<string, boolean>) => Promise<T>;

  /**
   * Fetches all records with optional query features (filtering, sorting, pagination).
   * @param queryString The query string containing filters, sorting, and pagination options.
   * @returns An object containing the data and pagination metadata.
   */
  getAll: (queryString: QueryString) => Promise<ApiResult<T>>;

  /**
   * Creates a new record.
   * @param data The data for the new record (excluding auto-generated fields).
   * @returns The created record.
   */
  createOne: (data: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<T>;

  /**
   * Updates a record by ID.
   * @param id The ID of the record to update.
   * @param data The updated data.
   * @throws {ApiError} If the record is not found.
   */
  updateOne: (id: string, data: Partial<T>) => Promise<T>;

  /**
   * Deletes a record by ID.
   * @param id The ID of the record to delete.
   * @throws {ApiError} If the record is not found.
   */
  deleteOne: (id: string) => Promise<T>;

  /**
   * Executes a callback within a Prisma transaction.
   * @param callback A callback function that receives a transactional service instance.
   * @returns The result of the callback.
   * @throws {ApiError} If the transaction fails.
   */
  transaction: <R>(
    callback: (txService: BaseService<T>) => Promise<R>
  ) => Promise<R>;
}

/**
 * Factory function to create a base service with common CRUD operations
 * @param model The Prisma model delegate to use for database operations
 * @param prismaClient The Prisma client instance
 * @param modelName The name of the model (for logging)
 */
const createBaseService = <T extends Record<string, any>>(
  model: PrismaModelDelegate<T>,
  modelName: string
): BaseService<T> => {
  const service = {
    async getOne(id: string, include?: Record<string, boolean>): Promise<T> {
      logger.info(`Fetching ${modelName} by ID`, { id, modelName });

      const doc = await model.findUnique({
        where: { id },
        include,
      });

      if (!doc) {
        logger.warn(`${modelName} not found with ID: ${id}`);

        throw new ApiError(
          `No ${modelName} found with that ID`,
          404,
          "fail",
          true,
          AppErrorCode.RECORD_NOT_FOUND
        );
      }

      return doc;
    },

    async getAll(queryString: QueryString): Promise<ApiResult<T>> {
      logger.info(`Fetching all ${modelName}s with filters`, {
        filters: queryString,
        modelName,
      });
      const startTime = Date.now();

      const features = new ApiFeatures<T>(prisma, queryString, modelName)
        .filter()
        .sort()
        .limitFields()
        .keywordSearch();
      const result = await features.execute();
      const duration = Date.now() - startTime;

      logger.info(`Successfully fetched ${result.data.length} ${modelName}s`, {
        count: result.data.length,
        totalResults: result.pagination?.total,
        page: result.pagination?.page,
        durationMs: duration,
        modelName,
      });

      return result;
    },

    async createOne(
      data: Omit<T, "id" | "createdAt" | "updatedAt">
    ): Promise<T> {
      logger.info(`Creating new ${modelName}`, { modelName });

      try {
        const doc = await model.create({ data });
        logger.info(`Successfully created ${modelName}`, {
          id: doc.id,
          modelName,
        });

        return doc;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          logger.error(`Failed to create ${modelName}`, { error, modelName });
          throw error;
        }
        throw error;
      }
    },

    async updateOne(id: string, data: Partial<T>): Promise<T> {
      logger.info(`Updating ${modelName}`, { id, modelName });
      try {
        const doc = await model.update({ where: { id }, data });
        logger.info(`Successfully updated ${modelName}`, { id, modelName });
        return doc;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          logger.warn(`Failed to update ${modelName}`, {
            error,
            id,
            modelName,
          });
          throw error; // Let errorHandler handle Prisma errors
        }
        throw error;
      }
    },

    async deleteOne(id: string): Promise<T> {
      logger.info(`Deleting ${modelName}`, { id, modelName });

      try {
        const doc = await model.delete({ where: { id } });
        logger.info(`Successfully deleted ${modelName}`, { id, modelName });
        return doc;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          logger.warn(`Failed to delete ${modelName}`, {
            error,
            id,
            modelName,
          });
          throw error; // Let errorHandler handle Prisma errors
        }
        throw error;
      }
    },

    async transaction<R>(
      callback: (txService: BaseService<T>) => Promise<R>
    ): Promise<R> {
      logger.info(`Starting transaction for ${modelName}`, { modelName });
      try {
        const result = await prisma.$transaction(async (tx) => {
          const txService = createBaseService<T>(model, modelName);
          return await callback(txService);
        });
        logger.info(`Transaction completed successfully for ${modelName}`, {
          modelName,
        });
        return result;
      } catch (error) {
        logger.error(`Transaction failed for ${modelName}`, {
          error,
          modelName,
        });
        if (error instanceof ApiError) throw error;
        throw new ApiError(
          "Transaction failed",
          500,
          "error",
          false,
          AppErrorCode.INTERNAL_SERVER_ERROR,
          { error }
        );
      }
    },
  };

  return service;
};

export default createBaseService;
