import { eq } from "drizzle-orm";
import { db, users } from "src/db";

export class UserRepository {
  async findByEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    return result[0] ?? null;
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] ?? null;
  }

  async create(input: CreateUserInput) {
    const [user] = await db
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
