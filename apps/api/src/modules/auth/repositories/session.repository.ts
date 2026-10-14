import { and, eq, isNull } from "drizzle-orm";
import { sessions } from "@/db";
import type { Database } from "@/db/client";
import type { Session } from "@/db/schema";
import type {
  CreateSessionInput,
  RotateSessionInput,
} from "@/modules/auth/types";

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

  async findById(sessionId: string): Promise<Session | null> {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    return result[0] ?? null;
  }

  async findByPreviousTokenHash(
    previousTokenHash: string,
  ): Promise<Session | null> {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.previousTokenHash, previousTokenHash))
      .limit(1);

    return result[0] ?? null;
  }

  async rotate(input: RotateSessionInput): Promise<Session | null> {
    const [session] = await this.db
      .update(sessions)
      .set({
        refreshTokenHash: input.nextHash,
        previousTokenHash: input.currentHash,
        lastUsedAt: input.usedAt,
      })
      .where(
        and(
          eq(sessions.id, input.sessionId),
          eq(sessions.refreshTokenHash, input.currentHash),
          isNull(sessions.revokedAt),
        ),
      )
      .returning();

    return session ?? null;
  }

  async revoke(sessionId: string): Promise<Session | null> {
    const [session] = await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.id, sessionId), isNull(sessions.revokedAt)))
      .returning();

    return session ?? null;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
  }
}
