import type { AuthenticatedUser, LoginRequest } from "@btctu/shared";
import type { Session, User } from "@/db/schema";
import type { CreateSessionInput, RotateSessionInput } from "./types";

export type AuthPrincipal = {
  userId: string;
  sessionId: string;
};

export type { AuthenticatedUser };

export type SessionTokens = {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

export type LoginInput = LoginRequest;

export type LoginResult = SessionTokens & { user: AuthenticatedUser };

export type RefreshResult = SessionTokens & { user: AuthenticatedUser };

export type UserStore = {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
};

export type SessionStore = {
  create(data: CreateSessionInput): Promise<Session>;
  findById(sessionId: string): Promise<Session | null>;
  findByRefreshTokenHash(refreshTokenHash: string): Promise<Session | null>;
  findByPreviousTokenHash(previousTokenHash: string): Promise<Session | null>;
  rotate(input: RotateSessionInput): Promise<Session | null>;
  revoke(sessionId: string): Promise<Session | null>;
  revokeAllForUser(userId: string): Promise<void>;
};

export type AuthEvent =
  | { type: "login_succeeded"; userId: string; sessionId: string }
  | {
      type: "login_failed";
      reason: "unknown_account" | "bad_password" | "disabled";
      userId?: string;
    }
  | { type: "session_refreshed"; userId: string; sessionId: string }
  | { type: "session_reuse_detected"; userId: string; sessionId: string }
  | { type: "logout"; userId: string; sessionId: string };

export type AuthPort = {
  login(input: LoginInput): Promise<LoginResult>;
  refresh(refreshToken: string): Promise<RefreshResult>;
  logout(refreshToken: string): Promise<void>;
  authenticate(accessToken: string): Promise<AuthPrincipal>;
  currentUser(principal: AuthPrincipal): Promise<AuthenticatedUser | null>;
};

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Email or password is incorrect");
    this.name = "InvalidCredentialsError";
  }
}

export class AccountDisabledError extends Error {
  constructor() {
    super("Account is disabled");
    this.name = "AccountDisabledError";
  }
}

export class InvalidSessionError extends Error {
  constructor(detail = "Session is not usable") {
    super(detail);
    this.name = "InvalidSessionError";
  }
}

export class SessionReuseError extends Error {
  constructor(
    readonly userId: string,
    readonly sessionId: string,
  ) {
    super("Refresh token reuse detected");
    this.name = "SessionReuseError";
  }
}

export class RotationInProgressError extends Error {
  constructor() {
    super("Refresh token rotation is already in progress");
    this.name = "RotationInProgressError";
  }
}

export class InvalidAccessTokenError extends Error {
  constructor() {
    super("Access token is invalid");
    this.name = "InvalidAccessTokenError";
  }
}
