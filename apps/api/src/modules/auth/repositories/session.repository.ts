import { and, eq, isNull } from "drizzle-orm";
import { db, sessions } from "src/db";

export class SessionRepository {
  async create(data: CreateSessionInput) {
    const [session] = await db.insert(sessions).values(data).returning();
    return session;
  }

  async findByRefreshTokenHash(refreshTokenHash: string) {
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshTokenHash, refreshTokenHash))
      .limit(1);

    return result[0] ?? null;
  }

  async findById() {}

  async revoke(sessionId: string) {
    const [session] = await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt)))
      .returning();

    return session ?? null;
  }

  async revokeAllForUser(userId: string) {
    const result = await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.userId, userId));
    return result;
  }
  async touch() {}
}
