import dotenv from "dotenv";

const envFile =
  process.env.ENV_FILE ?? `.env.${process.env.NODE_ENV || "local"}`;
dotenv.config({ path: envFile });

import { eq } from "drizzle-orm";
import { readEnv } from "@/env";
import { AUTH_POLICY } from "@/modules/auth/auth.policy";
import { loginRequestSchema } from "@/modules/auth/auth.schema";
import { PasswordService } from "@/modules/auth/password.service";
import { normalizeEmail } from "@/shared/string";
import { createDatabase } from "./client";
import { users } from "./schema";

function required(
  name: "ROOT_BOOTSTRAP_EMAIL" | "ROOT_BOOTSTRAP_PASSWORD",
): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function bootstrapRoot(): Promise<void> {
  const rawEmail = required("ROOT_BOOTSTRAP_EMAIL");
  const password = required("ROOT_BOOTSTRAP_PASSWORD");
  const validated = loginRequestSchema.safeParse({
    email: rawEmail,
    password,
  });
  if (!validated.success) {
    throw new Error(
      `ROOT_BOOTSTRAP_EMAIL and ROOT_BOOTSTRAP_PASSWORD must satisfy the login policy (${AUTH_POLICY.password.minLength}-${AUTH_POLICY.password.maxLength} password characters)`,
    );
  }
  const email = normalizeEmail(validated.data.email);
  const env = readEnv();
  const db = createDatabase(env.databaseUrl);

  try {
    const existingRoot = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.accountRole, "ROOT"));
    if (existingRoot[0]) {
      throw new Error("A root account already exists");
    }

    const existingEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));
    if (existingEmail[0]) {
      throw new Error("ROOT_BOOTSTRAP_EMAIL is already in use");
    }

    const passwordHash = await new PasswordService().hash(password);
    await db.insert(users).values({
      email,
      passwordHash,
      status: "ACTIVE",
      accountRole: "ROOT",
      mustChangePassword: false,
    });
  } finally {
    await db.$client.end();
  }
}

bootstrapRoot().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
