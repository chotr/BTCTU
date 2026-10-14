import type { User } from "@/db/schema";
import {
  AccountDisabledError,
  InvalidAccessTokenError,
  InvalidCredentialsError,
  InvalidSessionError,
  SessionReuseError,
  type AuthEvent,
  type AuthPort,
  type AuthPrincipal,
  type AuthenticatedUser,
  type LoginInput,
  type LoginResult,
  type RefreshResult,
  type SessionStore,
  type UserStore,
} from "./auth.types";
import type { PasswordService } from "./password.service";
import { SessionService, type StartedSession } from "./session.service";
import type { TokenService } from "./token.service";

export type AuthServiceOptions = {
  users: UserStore;
  sessions: SessionStore;
  passwords: PasswordService;
  tokens: TokenService;
  refreshTtlSeconds: number;
  now?: () => Date;
  onEvent?: (event: AuthEvent) => void;
};

export class AuthService implements AuthPort {
  private readonly sessions: SessionService;

  constructor(private readonly options: AuthServiceOptions) {
    this.sessions = new SessionService({
      sessions: options.sessions,
      tokens: options.tokens,
      refreshTtlSeconds: options.refreshTtlSeconds,
      now: options.now,
    });
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const user = await this.options.users.findByEmail(input.email);

    if (!user) {
      await this.options.passwords.verifyDecoy(input.password);
      this.emit({ type: "login_failed", reason: "unknown_account" });
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.options.passwords.verify(
      user.passwordHash,
      input.password,
    );
    if (!passwordMatches) {
      this.emit({
        type: "login_failed",
        reason: "bad_password",
        userId: user.id,
      });
      throw new InvalidCredentialsError();
    }

    if (user.status !== "ACTIVE") {
      this.emit({ type: "login_failed", reason: "disabled", userId: user.id });
      throw new AccountDisabledError();
    }

    const { session, refreshToken } = await this.sessions.start(user.id);
    const accessToken = await this.options.tokens.issueAccessToken(
      user.id,
      session.id,
    );
    this.emit({
      type: "login_succeeded",
      userId: user.id,
      sessionId: session.id,
    });

    return {
      user: toAuthenticatedUser(user),
      accessToken,
      expiresIn: this.options.tokens.accessTtlSeconds,
      refreshToken,
      refreshTokenExpiresAt: session.expiresAt,
    };
  }

  async refresh(refreshToken: string): Promise<RefreshResult> {
    const { session, refreshToken: rotated } =
      await this.rotateOrReportReuse(refreshToken);
    const user = await this.options.users.findById(session.userId);

    if (!user) {
      await this.sessions.revokeAllForUser(session.userId);
      throw new InvalidSessionError("Account no longer exists");
    }

    if (user.status !== "ACTIVE") {
      await this.sessions.revokeAllForUser(user.id);
      throw new AccountDisabledError();
    }

    const accessToken = await this.options.tokens.issueAccessToken(
      user.id,
      session.id,
    );
    this.emit({
      type: "session_refreshed",
      userId: user.id,
      sessionId: session.id,
    });

    return {
      user: toAuthenticatedUser(user),
      accessToken,
      expiresIn: this.options.tokens.accessTtlSeconds,
      refreshToken: rotated,
      refreshTokenExpiresAt: session.expiresAt,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const session = await this.sessions.revokeByRefreshToken(refreshToken);
    if (!session) return;

    this.emit({ type: "logout", userId: session.userId, sessionId: session.id });
  }

  async authenticate(accessToken: string): Promise<AuthPrincipal> {
    try {
      return await this.options.tokens.verifyAccessToken(accessToken);
    } catch {
      throw new InvalidAccessTokenError();
    }
  }

  async currentUser(
    principal: AuthPrincipal,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.options.users.findById(principal.userId);
    if (!user || user.status !== "ACTIVE") return null;

    return toAuthenticatedUser(user);
  }

  private async rotateOrReportReuse(
    refreshToken: string,
  ): Promise<StartedSession> {
    try {
      return await this.sessions.rotate(refreshToken);
    } catch (error) {
      if (error instanceof SessionReuseError) {
        this.emit({
          type: "session_reuse_detected",
          userId: error.userId,
          sessionId: error.sessionId,
        });
      }
      throw error;
    }
  }

  private emit(event: AuthEvent): void {
    this.options.onEvent?.(event);
  }
}

function toAuthenticatedUser(user: User): AuthenticatedUser {
  return { id: user.id, email: user.email, status: user.status };
}
