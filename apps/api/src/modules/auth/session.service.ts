import type { Session } from "@/db/schema";
import {
  InvalidSessionError,
  SessionReuseError,
  type SessionStore,
} from "./auth.types";
import type { TokenService } from "./token.service";

export type SessionServiceOptions = {
  sessions: SessionStore;
  tokens: TokenService;
  refreshTtlSeconds: number;
  now?: () => Date;
};

export type StartedSession = {
  session: Session;
  refreshToken: string;
};

export class SessionService {
  constructor(private readonly options: SessionServiceOptions) {}

  async start(userId: string): Promise<StartedSession> {
    const refreshToken = this.options.tokens.generateRefreshToken();
    const expiresAt = new Date(
      this.currentTime().getTime() + this.options.refreshTtlSeconds * 1000,
    );

    const session = await this.options.sessions.create({
      userId,
      refreshTokenHash: this.options.tokens.hashRefreshToken(refreshToken),
      expiresAt,
    });

    return { session, refreshToken };
  }

  async rotate(refreshToken: string): Promise<StartedSession> {
    const session = await this.find(refreshToken);
    if (!session) throw new InvalidSessionError("Unknown refresh token");

    if (session.revokedAt) {
      await this.options.sessions.revokeAllForUser(session.userId);
      throw new SessionReuseError(session.userId, session.id);
    }

    if (session.expiresAt.getTime() <= this.currentTime().getTime()) {
      throw new InvalidSessionError("Refresh token expired");
    }

    await this.options.sessions.revoke(session.id);
    return this.start(session.userId);
  }

  async revokeByRefreshToken(refreshToken: string): Promise<Session | null> {
    const session = await this.find(refreshToken);
    if (!session) return null;

    return this.options.sessions.revoke(session.id);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.options.sessions.revokeAllForUser(userId);
  }

  private find(refreshToken: string): Promise<Session | null> {
    return this.options.sessions.findByRefreshTokenHash(
      this.options.tokens.hashRefreshToken(refreshToken),
    );
  }

  private currentTime(): Date {
    return this.options.now?.() ?? new Date();
  }
}
