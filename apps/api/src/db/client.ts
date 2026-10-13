import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { readEnv } from "src/env";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: readEnv().databaseUrl,
  max: 10,
});

export const db = drizzle({
  client: pool,
  schema,
});
