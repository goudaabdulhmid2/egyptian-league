import { PrismaClient } from "@prisma/client";
import ApiFeatures, { QueryString, ApiResult } from "../utils/apiFeatures";
import ApiError from "../utils/apiError";
import { AppErrorCode } from "../types/errorTypes";

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
  getOne: (id: string, include?: Record<string, boolean>) => Promise<T>;
  getAll: (queryString: QueryString) => Promise<ApiResult<T>>;
  createOne: (data: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<T>;
  updateOne: (id: string, data: Partial<T>) => Promise<T>;
  deleteOne: (id: string) => Promise<T>;
  transaction: <R>(
    callback: (txService: BaseService<T>) => Promise<R>
  ) => Promise<R>;
}

const createBaseService = <T extends Record<string, any>>(
  model: PrismaModelDelegate<T>,
  prismaClient: PrismaClient,
  modelName: string
): BaseService<T> => {
  const service = {
    async getOne(id: string, include?: Record<string, boolean>): Promise<T> {
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

    async getAll(queryString: QueryString): Promise<ApiResult<T>> {
      const features = await new ApiFeatures<T>(
        prismaClient,
        queryString,
        modelName
      )
        .filter()
        .sort()
        .limitFields()
        .keywordSearch()
        .paginate();

      return await features.execute();
    },

    async createOne(
      data: Omit<T, "id" | "createdAt" | "updatedAt">
    ): Promise<T> {
      return await model.create({ data });
    },

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

    async deleteOne(id: string): Promise<T> {
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

      return doc;
    },

    async transaction<R>(
      callback: (txService: BaseService<T>) => Promise<R>
    ): Promise<R> {
      return await prismaClient.$transaction(async (tx) => {
        const txModel = (tx as any)[modelName] as PrismaModelDelegate<T>;
        const txService = createBaseService<T>(
          txModel,
          tx as unknown as PrismaClient,
          modelName
        );
        return await callback(txService);
      });
    },
  };

  return service;
};

export default createBaseService;
