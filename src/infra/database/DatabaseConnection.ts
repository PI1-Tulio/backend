import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "@prisma/client";
import { env } from "../../config/env";

export class DatabaseConnetion {
  private constructor() { }

  private static CONNECTION: PrismaClient | null = null;
  static getConnection(): PrismaClient {
    if (this.CONNECTION === null) {
      const connectionString = `${env.DATABASE_URL}`;
      const adapter = new PrismaBetterSqlite3({ url: connectionString });
      this.CONNECTION = new PrismaClient({ adapter });
    }
    return this.CONNECTION;
  }
}