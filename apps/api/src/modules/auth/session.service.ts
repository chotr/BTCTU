import type { Session } from "@/db/schema";
import { createHash, randomBytes } from "node:crypto";
import {
  InvalidSessionError,
  RotationInProgressError,
  SessionReuseError,
  type SessionStore,
} from "./auth.types";

export function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(refreshToken: string): string {
  return createHash("sha256").update(refreshToken).digest("hex");
}

export type SessionServiceOptions = {
  sessions: SessionStore;
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
    const refreshToken = generateRefreshToken();
    const expiresAt = new Date(
      this.currentTime().getTime() + this.options.refreshTtlSeconds * 1000,
    );

    const session = await this.options.sessions.create({
      userId,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt,
    });

    return { session, refreshToken };
  }

  async rotate(refreshToken: string): Promise<StartedSession> {
    const presentedHash = hashRefreshToken(refreshToken);
    const current =
      await this.options.sessions.findByRefreshTokenHash(presentedHash);

    if (current) {
      if (current.revokedAt) {
        throw new InvalidSessionError("Session was revoked");
      }
      if (current.expiresAt.getTime() <= this.currentTime().getTime()) {
        throw new InvalidSessionError("Refresh token expired");
      }

      return this.rotateCurrent(current, presentedHash);
    }

    const replayed =
      await this.options.sessions.findByPreviousTokenHash(presentedHash);
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
      hashRefreshToken(refreshToken),
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
    const nextToken = generateRefreshToken();
    const rotated = await this.options.sessions.rotate({
      sessionId: session.id,
      currentHash: presentedHash,
      nextHash: hashRefreshToken(nextToken),
      usedAt: this.currentTime(),
    });

    if (rotated) return { session: rotated, refreshToken: nextToken };

    const latest =
      await this.options.sessions.findByPreviousTokenHash(presentedHash);
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
