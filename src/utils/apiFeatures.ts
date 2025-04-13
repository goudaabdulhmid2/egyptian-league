import { Prisma, PrismaClient } from "@prisma/client";
import ApiError from "./apiError";
import { AppErrorCode } from "../types/errorTypes";
import logger from "../utils/logger";
import { modelFields } from "./modelFields";

/**
 * Interface for pagination results
 */
export interface PaginationResult {
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
  pagination: PaginationResult;
}

/**
 * Streamlined ApiFeatures class with reduced error handling redundancy
 */
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
  private validFields: Set<string> | null = null;

  /**
   * Creates an instance of ApiFeatures.
   * @param prisma - PrismaClient instance.
   * @param queryString - Query parameters from the request.
   * @param modelName - Name of the Prisma model to query.
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
   * Fetches and caches the fields of the Prisma model dynamically.
   * @returns A Set of field names for the model.
   * @throws {ApiError} If the model schema cannot be fetched.
   */

  private fetchModelFields(): Set<string> {
    // Return cached fields if available
    if (this.validFields) return this.validFields;

    const fields = modelFields[this.modelName] || undefined;
    if (!fields) {
      throw new ApiError(
        `Invalid model name: ${this.modelName}`,
        500,
        "error",
        false,
        AppErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    this.validFields = new Set(fields);
    logger.debug(`Fetched model fields for ${this.modelName}`, {
      fields: Array.from(fields),
      modelName: this.modelName,
    });
    return this.validFields;
  }

  /**
   * Validates that fields exist in the Prisma model schema.
   * @param fields - The fields to validate.
   * @throws {ApiError} If any field does not exist in the model schema.
   */
  private validateFields(fields: string[]): void {
    const validFields = this.fetchModelFields();
    const invalidFields = fields.filter((field) => !validFields.has(field));

    if (invalidFields.length > 0) {
      throw new ApiError(
        `Invalid fields: ${invalidFields.join(", ")}`,
        400,
        "fail",
        true,
        AppErrorCode.INVALID_FIELD_NAME,
        { invalidFields }
      );
    }
  }

  /**
   * Applies filters to the query based on request query parameters
   * @returns The current ApiFeatures instance for chaining
   */
  public filter(): ApiFeatures<T> {
    const queryObject = { ...this.queryString };
    this.excludedFields.forEach((field) => delete queryObject[field]);

    const fieldsToValidate = Object.keys(queryObject);
    if (fieldsToValidate.length > 0) this.validateFields(fieldsToValidate);

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
    logger.debug(`Applied filters for ${this.modelName}`, {
      filters: where,
      modelName: this.modelName,
    });

    return this;
  }

  /**
   * Adds complex filter conditions to the query
   * @param condition - Complex filter condition as a Prisma JSON object
   * @returns The current ApiFeatures instance for chaining
   */
  public addComplexFilter(condition: Prisma.JsonObject): ApiFeatures<T> {
    this.queryOptions.where = {
      AND: [this.queryOptions.where || {}, condition],
    };

    logger.debug(`Added complex filter for ${this.modelName}`, {
      condition,
      modelName: this.modelName,
    });

    return this;
  }

  /**
   * Applies sorting to the query based on the sort parameter
   * @returns The current ApiFeatures instance for chaining
   */
  public sort(): ApiFeatures<T> {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.toString().split(",");
      const cleanFields = sortFields.map((f) => f.replace("-", ""));

      // Validate sort fields
      this.validateFields(cleanFields);

      const orderBy: Record<string, string> = {};

      sortFields.forEach((field) => {
        const order = field.startsWith("-") ? "desc" : "asc";
        const cleanField = field.replace("-", "");
        orderBy[cleanField] = order;
      });

      this.queryOptions.orderBy = orderBy;
    } else {
      // Default sorting
      this.queryOptions.orderBy = { id: "desc" };
    }

    logger.debug(`Applied sorting for ${this.modelName}`, {
      orderBy: this.queryOptions.orderBy,
      modelName: this.modelName,
    });

    return this;
  }
  /**
   * Limits the fields returned in the query result
   * @returns The current ApiFeatures instance for chaining
   */
  public limitFields(): ApiFeatures<T> {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .toString()
        .split(",")
        .map((f) => f.trim());

      // Validate field names
      this.validateFields(fields);

      const select: Record<string, boolean> = {};

      fields.forEach((field) => {
        select[field] = true;
      });

      this.queryOptions.select = select;
    } else {
      delete this.queryOptions.select;
    }

    logger.debug(`Limited fields for ${this.modelName}`, {
      select: this.queryOptions.select,
      modelName: this.modelName,
    });

    return this;
  }

  /**
   * Applies pagination to the query
   * @returns Promise resolving to the current ApiFeatures instance for chaining
   */
  public async paginate(): Promise<ApiFeatures<T>> {
    // Convert to numbers, handling both string and number inputs
    const page =
      typeof this.queryString.page === "number"
        ? this.queryString.page
        : Number(this.queryString.page) || 1;

    const limit =
      typeof this.queryString.limit === "number"
        ? this.queryString.limit
        : Number(this.queryString.limit) || 50;

    // Validate pagination parameters
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

    // Count total records - any Prisma errors will be caught by global handler
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

    logger.debug(`Applied pagination for ${this.modelName}`, {
      page,
      limit,
      skip,
      total,
      modelName: this.modelName,
    });

    return this;
  }

  /**
   * Applies a keyword search to the specified field
   * @param field - The field to search in, defaults to 'name'
   * @returns The current ApiFeatures instance for chaining
   */
  public keywordSearch(field: string = "name"): ApiFeatures<T> {
    if (this.queryString.keyword) {
      const keyword = this.queryString.keyword.toString().trim();

      if (keyword.length < 1) {
        throw new ApiError(
          "Search keyword cannot be empty",
          400,
          "fail",
          true,
          AppErrorCode.EMPTY_KEYWORD,
          { field }
        );
      }

      // Validate the search field exists in the model
      this.validateFields([field]);

      const existingWhere = (this.queryOptions.where as object) || {};

      this.queryOptions.where = {
        ...existingWhere,
        [field]: {
          contains: keyword,
          mode: "insensitive",
        },
      };

      logger.debug(`Applied keyword search for ${this.modelName}`, {
        field,
        keyword,
        modelName: this.modelName,
      });
    }

    return this;
  }

  /**
   * Executes the query with all applied features
   * @returns Promise resolving to the query results and pagination info
   */
  public async execute(): Promise<ApiResult<T>> {
    // Ensure pagination is applied
    if (!this.paginationResult) {
      await this.paginate();
    }

    const startTime = Date.now();
    // Execute the query - any Prisma errors will be caught by global handler
    logger.debug(`Executing query for ${this.modelName}`, {
      queryOptions: this.queryOptions,
      modelName: this.modelName,
    });

    const data = await (this.prisma as any)[this.modelName].findMany(
      this.queryOptions as any
    );

    const duration = Date.now() - startTime;
    logger.info(`Executed query for ${this.modelName}`, {
      count: data.length,
      durationMs: duration,
      modelName: this.modelName,
    });

    return {
      data,
      pagination: this.paginationResult!,
    };
  }

  /**
   * Executes the query within a transaction
   * @returns Promise resolving to the query results and pagination info
   */
  public async executeWithTransaction(): Promise<ApiResult<T>> {
    return await this.prisma.$transaction(async (tx) => {
      const tempPrisma = tx as unknown as PrismaClient;

      // Create a new instance to work with the transaction
      const featuresInTransaction = new ApiFeatures<T>(
        tempPrisma,
        this.queryString,
        this.modelName
      );

      // Copy the query options
      Object.assign(featuresInTransaction.queryOptions, this.queryOptions);

      // Execute within transaction context
      return await featuresInTransaction.execute();
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
