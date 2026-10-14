import dotenv from "dotenv";

const envFile =
  process.env.ENV_FILE ?? `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({ path: envFile });

import { PasswordService } from "@/modules/auth/password.service";
import { normalizeEmail } from "@/shared/string";
import { readEnv } from "../env";
import { createDatabase } from "./client";
import { users } from "./schema";

const DEV_ACCOUNTS = [
  "leader@btctu.local",
  "head@btctu.local",
  "staff@btctu.local",
];

const DEFAULT_PASSWORD = "dev-only-changeme";

async function seed(): Promise<void> {
  const env = readEnv();
  const password = process.env.DEV_SEED_PASSWORD ?? DEFAULT_PASSWORD;
  const passwordHash = await new PasswordService().hash(password);
  const db = createDatabase(env.databaseUrl);

  try {
    for (const email of DEV_ACCOUNTS) {
      await db
        .insert(users)
        .values({
          email: normalizeEmail(email),
          passwordHash,
          status: "ACTIVE",
        })
        .onConflictDoUpdate({
          target: users.email,
          set: { passwordHash, status: "ACTIVE", updatedAt: new Date() },
        });
    }
  } finally {
    await db.$client.end();
  }

  console.log(`Seeded ${DEV_ACCOUNTS.length} development accounts:`);
  for (const email of DEV_ACCOUNTS) {
    console.log(`  - ${normalizeEmail(email)}`);
  }
  if (!process.env.DEV_SEED_PASSWORD) {
    console.warn(
      `Using the default development password "${DEFAULT_PASSWORD}"; set DEV_SEED_PASSWORD to override it.`,
    );
  }
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
