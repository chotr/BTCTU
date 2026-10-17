import dotenv from "dotenv";
import { eq, inArray } from "drizzle-orm";

const envFile =
  process.env.ENV_FILE ?? `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({ path: envFile });

import { PasswordService } from "@/modules/auth/password.service";
import { MANAGER_SEED_ACCOUNTS } from "@/manager-directory";
import { normalizeEmail } from "@/shared/string";
import { readEnv } from "../env";
import { createDatabase } from "./client";
import { users } from "./schema";

const SEEDED_ACCOUNTS = MANAGER_SEED_ACCOUNTS.map((account) => ({
  ...account,
  accountRole: "USER" as const,
}));

const SAMPLE_ROOT_EMAIL = "root@example.test";

const SYSTEM_SEED_ACCOUNTS = [
  {
    email: SAMPLE_ROOT_EMAIL,
    directoryActorId: null,
    accountRole: "ROOT" as const,
  },
  {
    email: "iam-admin@example.test",
    directoryActorId: null,
    accountRole: "ACCOUNT_ADMIN" as const,
  },
];

const LEGACY_SAMPLE_EMAILS = [
  "leader@btctu.local",
  "head@btctu.local",
  "staff@btctu.local",
];

const DEFAULT_PASSWORD = "dev-only-changeme";

async function seed(): Promise<void> {
  const env = readEnv();
  if (env.environment === "production") {
    throw new Error("Sample accounts cannot be seeded in production.");
  }

  const password = process.env.DEV_SEED_PASSWORD ?? DEFAULT_PASSWORD;
  const passwordHash = await new PasswordService().hash(password);
  const db = createDatabase(env.databaseUrl);

  try {
    const existingRoot = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.accountRole, "ROOT"));
    if (existingRoot[0] && existingRoot[0].email !== SAMPLE_ROOT_EMAIL) {
      throw new Error("A non-sample root account already exists.");
    }

    await db
      .delete(users)
      .where(inArray(users.email, LEGACY_SAMPLE_EMAILS));

    for (const account of [...SEEDED_ACCOUNTS, ...SYSTEM_SEED_ACCOUNTS]) {
      await db
        .insert(users)
        .values({
          email: normalizeEmail(account.email),
          directoryActorId: account.directoryActorId,
          passwordHash,
          status: "ACTIVE",
          accountRole: account.accountRole,
          mustChangePassword: false,
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            directoryActorId: account.directoryActorId,
            passwordHash,
            status: "ACTIVE",
            accountRole: account.accountRole,
            mustChangePassword: false,
            updatedAt: new Date(),
          },
        });
    }
  } finally {
    await db.$client.end();
  }

  console.log(
    `Seeded ${SEEDED_ACCOUNTS.length} sample manager accounts and ${SYSTEM_SEED_ACCOUNTS.length} IAM accounts:`,
  );
  for (const account of [...SEEDED_ACCOUNTS, ...SYSTEM_SEED_ACCOUNTS]) {
    console.log(
      `  - ${normalizeEmail(account.email)} -> ${account.directoryActorId}`,
    );
  }
  console.log("Removed legacy sample accounts when present.");
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
