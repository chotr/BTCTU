import { eq } from "drizzle-orm";
import { users } from "@/db";
import type { Database } from "@/db/client";
import type { User } from "@/db/schema";
import type { CreateUserInput } from "@/modules/auth/types";
import { normalizeEmail } from "@/shared/string";

export class UserRepository {
  constructor(private readonly db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = normalizeEmail(email);
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    return result[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        email: normalizeEmail(input.email),
        passwordHash: input.passwordHash,
        status: "ACTIVE",
      })
      .returning();

    return user;
  }

  async updatePassword(
    id: string,
    passwordHash: string,
    mustChangePassword: boolean,
  ): Promise<User | null> {
    const [user] = await this.db
      .update(users)
      .set({ passwordHash, mustChangePassword })
      .where(eq(users.id, id))
      .returning();

    return user ?? null;
  }
}
