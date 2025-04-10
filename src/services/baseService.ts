import prisma from "../config/db";
import ApiFeatures, { QueryString, ApiResult } from "../utils/apiFeatures";
import ApiError from "../utils/apiError";
import { AppErrorCode } from "../types/errorTypes";

// Define a type for Prisma model delegates (e.g., prisma.team, prisma.player)
type PrismaModelDelegate<T> = {
  findUnique: (args: any) => Promise<T | null>;
  findMany: (args?: any) => Promise<T[]>;
  count: (args?: any) => Promise<number>;
  create: (args: any) => Promise<T>;
  update: (args: any) => Promise<T>;
  delete: (args: any) => Promise<T>;
};

// Define a type for the service methods
interface BaseService<T> {
  getOne: (id: string, include?: Record<string, boolean>) => Promise<T | null>;
  getAll: (
    queryString: QueryString,
    modelName: string,
    include?: Record<string, boolean>
  ) => Promise<ApiResult<T>>;
  createOne: (data: Omit<T, "id" | "createdAt">) => Promise<T>;
  updateOne: (id: string, data: Partial<T>) => Promise<T>;
  deleteOne: (id: string) => Promise<void>;
}

const createBaseService = <T extends Record<string, any>>(
  model: PrismaModelDelegate<T>
): BaseService<T> => {
  return {
    // Get one record bu ID
    async getOne(
      id: string,
      include?: Record<string, boolean>
    ): Promise<T | null> {
      const doc = await model.findUnique({
        where: { id },
        include,
      });
      if (!doc) {
        throw new ApiError(
          "No document found with that ID",
          404,
          "fail",
          true,
          AppErrorCode.RECORD_NOT_FOUND
        );
      }

      return doc;
    },

    // Get all recordes
    async getAll(
      queryString: QueryString,
      modelName: string,
      include?: Record<string, boolean>
    ) {
      const features = await new ApiFeatures<T>(prisma, queryString, modelName)
        .filter()
        .sort()
        .limitFields()
        .keywordSearch()
        .includeRelations(include ? Object.keys(include) : [])
        .paginate();
      const result = await features.execute();
      return { data: result.data, pagination: result.pagination };
    },

    // Create
    async createOne(data: Omit<T, "id" | "createdAt">): Promise<T> {
      return await model.create({ date: data });
    },

    // Async updateOne by ID
    async updateOne(id: string, data: Partial<T>): Promise<T> {
      const doc = await model.update({ where: { id }, data });
      if (!doc) {
        throw new ApiError(
          "No document found with that ID",
          404,
          "fail",
          true,
          AppErrorCode.RECORD_NOT_FOUND
        );
      }

      return doc;
    },

    // Delete one
    async deleteOne(id: string): Promise<void> {
      const doc = await model.delete({ where: { id } });
      if (!doc) {
        throw new ApiError(
          "No document found with that ID",
          404,
          "fail",
          true,
          AppErrorCode.RECORD_NOT_FOUND
        );
      }
    },
  };
};

export default createBaseService;
