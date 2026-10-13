import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { readEnv } from "../env";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: readEnv().databaseUrl,
  max: 10,
});

export const db = drizzle({
  client: pool,
  schema,
});

export type Database = typeof db;