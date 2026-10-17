import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { normalizePostgresUrl } from "../env";

export type Database = ReturnType<typeof createDatabase>;

export function createDatabase(
  connectionString: string,
  options: { max?: number } = {},
) {
  return drizzle({
    client: new Pool({
      connectionString: normalizePostgresUrl(connectionString),
      max: options.max ?? 10,
    }),
    schema,
  });
}
