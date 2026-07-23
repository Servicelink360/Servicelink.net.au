import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
  webPostgres?: ReturnType<typeof postgres>;
  webDb?: Db;
};

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return postgres(url, {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 10,
  });
}

export function getDb(): Db {
  if (!globalForDb.webPostgres) {
    globalForDb.webPostgres = createClient();
  }

  if (!globalForDb.webDb) {
    globalForDb.webDb = drizzle(globalForDb.webPostgres, { schema });
  }

  return globalForDb.webDb;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export { schema };
