import { and, eq, isNull } from "drizzle-orm";
import { Session, sessions } from "src/db";
import { CreateSessionInput } from "../types";
import { Database } from "src/db/client";

export class SessionRepository {
  constructor(private readonly db: Database) {}

  async create(data: CreateSessionInput): Promise<Session> {
    const [session] = await this.db.insert(sessions).values(data).returning();
    return session;
  }

  async findByRefreshTokenHash(
    refreshTokenHash: string,
  ): Promise<Session | null> {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshTokenHash, refreshTokenHash))
      .limit(1);

    return result[0] ?? null;
  }

  async revoke(sessionId: string): Promise<Session | null> {
    const [session] = await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt)))
      .returning();

    return session ?? null;
  }

  async revokeAllForUser(userId: string) {
    const result = await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
    return result;
  }
}
