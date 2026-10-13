import dotenv from "dotenv";

const envFile =
  process.env.ENV_FILE ?? `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({ path: envFile });

import { defineConfig } from "drizzle-kit";
import { readEnv } from "./src/env";

const databaseUrl = readEnv().databaseUrl;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl!,
  },
});
