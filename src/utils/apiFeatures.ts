import { Prisma } from "@prisma/client";

import PrismaClient from "../config/db";
import ApiError from "./apiError";
import { AppErrorCode } from "../types/errorTypes";
import { number, object } from "zod";

interface QueryString {
  [key: string]: string | undefined;
  sort?: string;
  page?: string;
  limit?: string;
  fields?: string;
  keyword?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  numberOfPage: number;
  nextPage?: number;
  prevPage?: number;
  total: number;
}

class ApiFeatures<T> {
  private paginationInfo: PaginationInfo | null = null;
  private where: Prisma.JsonObject = {};
  private orderBy: Prisma.JsonObject[] = [];
  private select: Prisma.JsonObject = {};
  private skip: number = 0;
  private take: number = 50;

  constructor(
    private queryString: QueryString,
    private modelName: string
  ) {}

  filter() {
    const queryObject = { ...this.queryString };
    const excludedFields = ["sort", "page", "limit", "fields", "keyword"];
    excludedFields.forEach((el) => delete queryObject[el]);

    // Convert query operators
    Object.keys(queryObject).forEach((key) => {
      const value = queryObject[key];
      if (typeof value === "object") {
        Object.keys(value).forEach((operator) => {
          switch (operator) {
            case "gte":
              this.where[key] = { gte: value[operator] };
              break;
            case "gt":
              this.where[key] = { gt: value[operator] };
              break;
            case "lte":
              this.where[key] = { lte: value[operator] };
              break;
            case "lt":
              this.where[key] = { lt: value[operator] };
              break;
          }
        });
      } else {
        this.where[key] = value;
      }
    });
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortFields = this.queryString.sort.split(",");
      this.orderBy = sortFields.map((field) => {
        const order = field.startsWith("-") ? "desc" : "asc";
        const cleanField = field.replace("-", "");
        return { [cleanField]: order };
      });
    } else {
      this.orderBy = [{ createdAt: "desc" }];
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",");
      fields.forEach((field) => {
        this.select[field] = true;
      });
    }
    return this;
  }

  async paginate(totalCount: number) {
    const page = Number(this.queryString.page);
    const limit = Number(this.queryString.limit);
    const skip = (page - 1) * limit;

    this.skip = skip;
    this.take = limit;

    this.paginationInfo = {
      page,
      limit,
      numberOfPage: Math.ceil(totalCount / limit),
      total: totalCount,
    };

    if (page * limit < totalCount) {
      this.paginationInfo.nextPage = page + 1;
    }

    if (skip > 0) {
      this.paginationInfo.prevPage = page - 1;
    }

    return this;
  }
}
