import { PrismaClient } from "@prisma/client";

class Database {
  private static instance: Database | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new PrismaClient();
    }
    return Database.instance;
  }
}

export default Database.getInstance();
