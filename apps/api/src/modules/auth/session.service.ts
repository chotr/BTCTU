import type { Session } from "@/db/schema";
import {
  InvalidSessionError,
  RotationInProgressError,
  SessionReuseError,
  type SessionStore,
} from "./auth.types";
import type { RefreshTokenService } from "./refresh-token.service";

export type SessionServiceOptions = {
  sessions: SessionStore;
  refreshTokens: RefreshTokenService;
  refreshTtlSeconds: number;
  rotationGraceSeconds: number;
  now?: () => Date;
};

export type StartedSession = {
  session: Session;
  refreshToken: string;
};

export class SessionService {
  constructor(private readonly options: SessionServiceOptions) {}

  async start(userId: string): Promise<StartedSession> {
    const refreshToken = this.options.refreshTokens.generate();
    const expiresAt = new Date(
      this.currentTime().getTime() + this.options.refreshTtlSeconds * 1000,
    );

    const session = await this.options.sessions.create({
      userId,
      refreshTokenHash: this.options.refreshTokens.hash(refreshToken),
      expiresAt,
    });

    return { session, refreshToken };
  }

  async rotate(refreshToken: string): Promise<StartedSession> {
    const presentedHash = this.options.refreshTokens.hash(refreshToken);
    const current = await this.options.sessions.findByRefreshTokenHash(
      presentedHash,
    );

    if (current) {
      if (current.revokedAt) {
        throw new InvalidSessionError("Session was revoked");
      }
      if (current.expiresAt.getTime() <= this.currentTime().getTime()) {
        throw new InvalidSessionError("Refresh token expired");
      }

      return this.rotateCurrent(current, presentedHash);
    }

    const replayed = await this.options.sessions.findByPreviousTokenHash(
      presentedHash,
    );
    if (!replayed) throw new InvalidSessionError("Unknown refresh token");
    if (replayed.revokedAt) {
      throw new InvalidSessionError("Session was revoked");
    }

    return this.handleReplay(replayed);
  }

  async findActiveById(sessionId: string): Promise<Session | null> {
    const session = await this.options.sessions.findById(sessionId);
    if (!session || session.revokedAt) return null;
    if (session.expiresAt.getTime() <= this.currentTime().getTime()) {
      return null;
    }

    return session;
  }

  async revokeByRefreshToken(refreshToken: string): Promise<Session | null> {
    const session = await this.options.sessions.findByRefreshTokenHash(
      this.options.refreshTokens.hash(refreshToken),
    );
    if (!session) return null;

    return this.options.sessions.revoke(session.id);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.options.sessions.revokeAllForUser(userId);
  }

  private async rotateCurrent(
    session: Session,
    presentedHash: string,
  ): Promise<StartedSession> {
    const nextToken = this.options.refreshTokens.generate();
    const rotated = await this.options.sessions.rotate({
      sessionId: session.id,
      currentHash: presentedHash,
      nextHash: this.options.refreshTokens.hash(nextToken),
      usedAt: this.currentTime(),
    });

    if (rotated) return { session: rotated, refreshToken: nextToken };

    const latest = await this.options.sessions.findByPreviousTokenHash(
      presentedHash,
    );
    if (!latest) throw new InvalidSessionError("Refresh token is not usable");
    if (latest.revokedAt) throw new InvalidSessionError("Session was revoked");

    return this.handleReplay(latest);
  }

  private async handleReplay(session: Session): Promise<never> {
    if (this.withinGrace(session.lastUsedAt)) {
      throw new RotationInProgressError();
    }

    await this.options.sessions.revokeAllForUser(session.userId);
    throw new SessionReuseError(session.userId, session.id);
  }

  private withinGrace(moment: Date): boolean {
    return (
      this.currentTime().getTime() - moment.getTime() <=
      this.options.rotationGraceSeconds * 1000
    );
  }

  private currentTime(): Date {
    return this.options.now?.() ?? new Date();
  }
}
