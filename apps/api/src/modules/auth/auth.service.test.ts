import { describe, expect, it } from "vitest";
import { AuthService } from "./auth.service";
import { createInMemoryStores, createTestUser } from "./auth.test-helpers";
import {
  AccountDisabledError,
  InvalidAccessTokenError,
  InvalidCredentialsError,
  InvalidSessionError,
  RotationInProgressError,
  SessionReuseError,
  type AuthEvent,
} from "./auth.types";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

const PASSWORD = "Correct-Horse-1";
const tokens = new TokenService({
  accessSecret: "auth-service-secret",
  issuer: "btctu-api",
  audience: "btctu-web",
  accessTtlSeconds: 900,
});

async function createSubject(
  options: { now?: () => Date; onEvent?: (event: AuthEvent) => void } = {},
) {
  const stores = createInMemoryStores();
  const user = await createTestUser(stores, {
    email: "Officer@BTCTU.local",
    password: PASSWORD,
  });
  const events: AuthEvent[] = [];
  const service = new AuthService({
    users: stores.userStore,
    sessions: stores.sessionStore,
    passwords: new PasswordService(),
    tokens,
    refreshTtlSeconds: 604800,
    ...options,
    onEvent: (event) => {
      events.push(event);
      options.onEvent?.(event);
    },
  });

  return { events, service, stores, user };
}

describe("AuthService.login", () => {
  it("issues an access token and a stored session for valid credentials", async () => {
    const { events, service, stores, user } = await createSubject();

    const result = await service.login({
      email: "  Officer@BTCTU.local ",
      password: PASSWORD,
    });

    expect(result.user).toEqual({
      id: user.id,
      email: "officer@btctu.local",
      status: "ACTIVE",
    });
    expect(result.expiresIn).toBe(900);
    expect(result.refreshTokenExpiresAt.getTime()).toBeGreaterThan(
      Date.now() + 604_000_000,
    );

    const principal = await service.authenticate(result.accessToken);
    expect(principal.userId).toBe(user.id);
    const stored = stores.sessions.find((row) => row.id === principal.sessionId);
    expect(stored?.refreshTokenHash).toBe(
      tokens.hashRefreshToken(result.refreshToken),
    );
    expect(events).toContainEqual({
      type: "login_succeeded",
      userId: user.id,
      sessionId: principal.sessionId,
    });
  });

  it("rejects a wrong password without revealing the account", async () => {
    const { events, service, user } = await createSubject();

    await expect(
      service.login({ email: user.email, password: "Wrong-Password-1" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(events).toContainEqual({
      type: "login_failed",
      reason: "bad_password",
      userId: user.id,
    });
  });

  it("rejects an unknown account with the same error type", async () => {
    const { events, service } = await createSubject();

    await expect(
      service.login({ email: "nobody@btctu.local", password: PASSWORD }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(events).toContainEqual({
      type: "login_failed",
      reason: "unknown_account",
    });
  });

  it("refuses a disabled account even with the right password", async () => {
    const { events, service, stores } = await createSubject();
    stores.users[0].status = "DISABLED";

    await expect(
      service.login({ email: stores.users[0].email, password: PASSWORD }),
    ).rejects.toBeInstanceOf(AccountDisabledError);
    expect(events).toContainEqual({
      type: "login_failed",
      reason: "disabled",
      userId: stores.users[0].id,
    });
    expect(stores.sessions).toHaveLength(0);
  });
});

describe("AuthService session lifecycle", () => {
  it("rejects a token that is not a signed access token", async () => {
    const { service } = await createSubject();

    await expect(service.authenticate("garbage")).rejects.toBeInstanceOf(
      InvalidAccessTokenError,
    );
  });

  it("reports no current user once the account is disabled", async () => {
    const { service, stores, user } = await createSubject();
    stores.users[0].status = "DISABLED";

    await expect(
      service.currentUser({ userId: user.id, sessionId: "session-1" }),
    ).resolves.toBeNull();
  });

  it("keeps the same session when the refresh token is rotated", async () => {
    const { events, service, user } = await createSubject();
    const login = await service.login({ email: user.email, password: PASSWORD });
    const before = await service.authenticate(login.accessToken);

    const refreshed = await service.refresh(login.refreshToken);
    const after = await service.authenticate(refreshed.accessToken);

    expect(refreshed.user.id).toBe(user.id);
    expect(refreshed.refreshToken).not.toBe(login.refreshToken);
    expect(after.sessionId).toBe(before.sessionId);
    expect(events.some((event) => event.type === "session_refreshed")).toBe(true);
  });

  it("treats a duplicate refresh inside the grace window as a race", async () => {
    const { service, user } = await createSubject();
    const login = await service.login({ email: user.email, password: PASSWORD });
    await service.refresh(login.refreshToken);

    await expect(service.refresh(login.refreshToken)).rejects.toBeInstanceOf(
      RotationInProgressError,
    );
  });

  it("treats a token replayed past the grace window as a leak", async () => {
    let now = new Date("2026-10-14T00:00:00.000Z");
    const { events, service, user } = await createSubject({ now: () => now });
    const login = await service.login({ email: user.email, password: PASSWORD });
    await service.refresh(login.refreshToken);
    now = new Date("2026-10-14T00:05:00.000Z");

    await expect(service.refresh(login.refreshToken)).rejects.toBeInstanceOf(
      SessionReuseError,
    );
    expect(events).toContainEqual({
      type: "session_reuse_detected",
      userId: user.id,
      sessionId: expect.any(String),
    });
  });

  it("stops accepting the access token once the session is revoked", async () => {
    const { service, user } = await createSubject();
    const login = await service.login({ email: user.email, password: PASSWORD });
    await expect(service.authenticate(login.accessToken)).resolves.toMatchObject(
      { userId: user.id },
    );

    await service.logout(login.refreshToken);

    await expect(service.authenticate(login.accessToken)).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
  });

  it("stops refreshing after logout", async () => {
    const { events, service, user } = await createSubject();
    const login = await service.login({ email: user.email, password: PASSWORD });

    await service.logout(login.refreshToken);

    await expect(service.refresh(login.refreshToken)).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
    expect(events.some((event) => event.type === "logout")).toBe(true);
  });

  it("revokes the session of a disabled account on refresh", async () => {
    const { service, stores, user } = await createSubject();
    const login = await service.login({ email: user.email, password: PASSWORD });
    stores.users[0].status = "DISABLED";

    await expect(service.refresh(login.refreshToken)).rejects.toBeInstanceOf(
      AccountDisabledError,
    );
    expect(stores.sessions.every((row) => row.revokedAt !== null)).toBe(true);
  });

  it("ignores a logout for an unknown refresh token", async () => {
    const { service } = await createSubject();

    await expect(service.logout("unknown-token")).resolves.toBeUndefined();
  });
});
