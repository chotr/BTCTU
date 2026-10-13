import { eq } from "drizzle-orm";
import { User, users } from "src/db";
import { CreateUserInput } from "../types";
import { normalizeEmail } from "src/shared/function";
import { Database } from "src/db/client";

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
}
