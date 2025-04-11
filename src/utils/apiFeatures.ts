import { Prisma, PrismaClient } from "@prisma/client";

import ApiError from "./apiError";
import { AppErrorCode } from "../types/errorTypes";
/**
 * Interface for pagination results
 */
interface PaginationResult {
  page: number;
  limit: number;
  numberOfPages: number;
  nextPage?: number;
  prevPage?: number;
  total: number;
}

/**
 * Type for query string parameters
 */
export interface QueryString {
  [key: string]: any;
  sort?: string;
  page?: string | number;
  limit?: string | number;
  fields?: string;
  keyword?: string;
}

/**
 * Interface for API features execution result
 */

export interface ApiResult<T> {
  data: T[];
  pagination?: PaginationResult;
}

class ApiFeatures<T extends Record<string, any>> {
  private queryOptions: Prisma.JsonObject;
  private paginationResult: PaginationResult | null = null;
  private excludedFields: string[] = [
    "sort",
    "page",
    "limit",
    "fields",
    "keyword",
  ];

  /**
   * Creates an instance of ApiFeatures.
   * @param prisma - PrismaClient instance
   * @param model - Name of the Prisma model to query
   * @param queryString - Query parameters from the request
   */

  constructor(
    private readonly prisma: PrismaClient,
    private readonly queryString: QueryString,
    private readonly modelName: string
  ) {
    this.queryOptions = {
      where: {},
      orderBy: {},
      select: {},
      skip: undefined,
      take: undefined,
    };
  }

  /**
   * Applies filters to the query based on request query parameters
   * Handles operators like gt, gte, lt, lte
   * @returns The current ApiFeatures instance for chaining
   */

  public filter(): ApiFeatures<T> {
    try {
      const queryObject = { ...this.queryString };
      this.excludedFields.forEach((field) => delete queryObject[field]);

      const where: Record<string, any> = {};

      Object.entries(queryObject).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          const conditions: Record<string, any> = {};

          Object.entries(value).forEach(([operator, operatorValue]) => {
            switch (operator) {
              case "gt":
              case "gte":
              case "lt":
              case "lte":
                conditions[operator] = operatorValue;
                break;
              default:
                where[key] = value;
            }
          });

          if (Object.keys(conditions).length > 0) {
            where[key] = conditions;
          }
        } else {
          where[key] = value;
        }
      });
      this.queryOptions.where = where;
    } catch (err) {
      console.error("Error in filter method", err);
      throw new ApiError(
        `Failed to apply filters`,
        500,
        "error",
        true,
        AppErrorCode.API_FEATURES_FILTER_ERROR,
        { queryString: this.queryString }
      );
    }

    return this;
  }

  /**
   * Adds complex filter conditions to the query
   * @param condition - Complex filter condition as a Prisma JSON object
   * @returns The current ApiFeatures instance for chaining
   * @throws ApiError if filter application fails
   */
  public addComplexFilter(condition: Prisma.JsonObject): ApiFeatures<T> {
    try {
      this.queryOptions.where = {
        AND: [this.queryOptions.where || {}, condition],
      };
      return this;
    } catch (err) {
      throw new ApiError(
        "Failed to add complex filter",
        500,
        "error",
        true,
        AppErrorCode.COMPLEX_FILTER_ERROR,
        { condition }
      );
    }
  }

  /**
   * Applies sorting to the query based on the sort parameter
   * @returns The current ApiFeatures instance for chaining
   */
  public sort(): ApiFeatures<T> {
    try {
      if (this.queryString.sort) {
        const sortFields = this.queryString.sort.toString().split(",");
        const orderBy: Record<string, string> = {};

        sortFields.forEach((field) => {
          const order = field.startsWith("-") ? "desc" : "asc";
          const cleanField = field.replace("-", "");
          orderBy[cleanField] = order;
        });

        this.queryOptions.orderBy = orderBy;
      } else {
        this.queryOptions.orderBy = { id: "desc" };
      }
    } catch (err) {
      console.error("Error in sort method:", err);
      throw new ApiError(
        "Failed to apply sorting",
        500,
        "error",
        true,
        AppErrorCode.API_FEATURES_SORT_ERROR,
        { sortParam: this.queryString.sort }
      );
    }

    return this;
  }

  /**
   * Limits the fields returned in the query result
   * @returns The current ApiFeatures instance for chaining
   */
  public limitFields(): ApiFeatures<T> {
    try {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.toString().split(",");
        const select: Record<string, boolean> = {};

        fields.forEach((field) => {
          select[field.trim()] = true;
        });

        this.queryOptions.select = select;
      } else {
        delete this.queryOptions.select;
      }
    } catch (err) {
      console.error("Error in limitFields method:", err);
      throw new ApiError(
        `Failed to limit fields`,
        500,
        "error",
        true,
        AppErrorCode.API_FEATURES_FIELDS_ERROR,
        { fieldsParam: this.queryString.fields }
      );
    }

    return this;
  }

  /**
   * Applies pagination to the query
   * @returns Promise resolving to the current ApiFeatures instance for chaining
   */
  public async paginate(): Promise<ApiFeatures<T>> {
    try {
      const page = Number(this.queryString.page) || 1;
      const limit = Number(this.queryString.limit) || 50;

      if (page < 1) {
        throw new ApiError(
          "Page number must be at least 1",
          400,
          "fail",
          true,
          AppErrorCode.INVALID_PAGE_NUMBER,
          { page }
        );
      }

      if (limit < 1 || limit > 100) {
        throw new ApiError(
          "Limit must be between 1 and 100",
          400,
          "fail",
          true,
          AppErrorCode.INVALID_LIMIT_VALUE,
          { limit }
        );
      }

      const skip = (page - 1) * limit;

      try {
        const total = await (this.prisma as any)[this.modelName].count({
          where: this.queryOptions.where as any,
        });

        this.queryOptions.skip = skip;
        this.queryOptions.take = limit;

        const endIndex = page * limit;

        this.paginationResult = {
          page,
          limit,
          numberOfPages: Math.ceil(total / limit),
          total,
        };

        if (endIndex < total) {
          this.paginationResult.nextPage = page + 1;
        }

        if (skip > 0) {
          this.paginationResult.prevPage = page - 1;
        }
      } catch (countError) {
        console.error("Error counting records:", countError);
        throw new ApiError(
          `Failed to count total records`,
          500,
          "error",
          true,
          AppErrorCode.DATABASE_COUNT_ERROR,
          { model: this.modelName }
        );
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err; // Re-throw if it's already an ApiError
      }

      console.error("Error in paginate method:", err);
      throw new ApiError(
        `Failed to apply pagination`,
        500,
        "error",
        true,
        AppErrorCode.API_FEATURES_PAGINATION_ERROR,
        { page: this.queryString.page, limit: this.queryString.limit }
      );
    }

    return this;
  }

  /**
   * Applies a keyword search to the specified field
   * @param field - The field to search in, defaults to 'name'
   * @returns The current ApiFeatures instance for chaining
   */

  public keywordSearch(field: string = "name"): ApiFeatures<T> {
    try {
      if (this.queryString.keyword) {
        const keyWord = this.queryString.keyword.toString().trim();

        if (keyWord.length < 1) {
          throw new ApiError(
            "Search keyword cannot be empty",
            400,
            "fail",
            true,
            AppErrorCode.EMPTY_KEYWORD,
            { field }
          );
        }

        const existingWhere = (this.queryOptions.where as object) || {};

        this.queryOptions.where = {
          ...existingWhere,
          [field]: {
            contains: keyWord,
            mode: "insensitive",
          },
        };
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err; // Re-throw if it's already an ApiError
      }

      console.error("Error in keywordSearch method:", err);
      throw new ApiError(
        `Failed to apply keyword search`,
        500,
        "error",
        true,
        AppErrorCode.API_FEATURES_KEYWORD_ERROR,
        { keyword: this.queryString.keyword, field }
      );
    }
    return this;
  }

  /**
   * Executes the query with all applied features
   * @returns Promise resolving to the query results and pagination info
   */

  public async execute(): Promise<ApiResult<T>> {
    try {
      if (!this.paginationResult) {
        await this.paginate();
      }

      try {
        const data = await (this.prisma as any)[this.modelName].findMany(
          this.queryOptions as any
        );

        return {
          data,
          pagination: this.paginationResult!,
        };
      } catch (queryError) {
        console.error("Database query error:", queryError);
        throw new ApiError(
          `Database query failed`,
          500,
          "error",
          false,
          AppErrorCode.DATABASE_QUERY_ERROR,
          { model: this.modelName, query: this.queryOptions }
        );
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw err; // Re-throw if it's already an ApiError
      }

      console.error("Error executing query:", err);
      throw new ApiError(
        `Failed to execute query: ${err}`,
        500,
        "error",
        true,
        AppErrorCode.API_FEATURES_EXECUTION_ERROR
      );
    }
  }

  /**
   * Executes the query within a transaction
   * @returns Promise resolving to the query results and pagination info
   * @throws ApiError if transaction or query execution fails
   */
  public async executeWithTransaction(): Promise<ApiResult<T>> {
    return await this.prisma.$transaction(async (tx) => {
      const tempPrisma = tx as unknown as PrismaClient;
      const originalPrisma = this.prisma;
      (this.prisma as any) = tempPrisma;

      try {
        const result = await this.execute();
        (this.prisma as any) = originalPrisma;
        return result;
      } catch (err) {
        (this.prisma as any) = originalPrisma;
        throw err;
      }
    });
  }

  /**
   * Gets the current query options
   * @returns The current query options object
   */
  public getQueryOptions(): Prisma.JsonObject {
    return { ...this.queryOptions };
  }
}

export default ApiFeatures;
