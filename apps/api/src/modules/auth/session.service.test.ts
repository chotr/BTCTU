import { describe, expect, it } from "vitest";
import { createInMemoryStores } from "./auth.test-helpers";
import {
  InvalidSessionError,
  RotationInProgressError,
  SessionReuseError,
} from "./auth.types";
import { SessionService } from "./session.service";
import { TokenService } from "./token.service";

const tokens = new TokenService({
  accessSecret: "session-service-secret",
  issuer: "btctu-api",
  audience: "btctu-web",
  accessTtlSeconds: 900,
});

function createService(
  options: {
    now?: () => Date;
    refreshTtlSeconds?: number;
    rotationGraceSeconds?: number;
  } = {},
) {
  const stores = createInMemoryStores();
  const service = new SessionService({
    sessions: stores.sessionStore,
    tokens,
    refreshTtlSeconds: options.refreshTtlSeconds ?? 604800,
    now: options.now,
    rotationGraceSeconds: options.rotationGraceSeconds,
  });

  return { stores, service };
}

describe("SessionService", () => {
  it("stores only the hash of the refresh token", async () => {
    const { service } = createService();

    const { session, refreshToken } = await service.start("user-1");

    expect(session.refreshTokenHash).toBe(tokens.hashRefreshToken(refreshToken));
    expect(session.refreshTokenHash).not.toBe(refreshToken);
    expect(session.previousTokenHash).toBeNull();
    expect(session.revokedAt).toBeNull();
    expect(session.userId).toBe("user-1");
  });

  it("rotates the token inside the same session", async () => {
    const { stores, service } = createService();
    const first = await service.start("user-1");

    const second = await service.rotate(first.refreshToken);

    expect(second.session.id).toBe(first.session.id);
    expect(stores.sessions).toHaveLength(1);
    expect(second.session.previousTokenHash).toBe(
      tokens.hashRefreshToken(first.refreshToken),
    );
    expect(second.session.refreshTokenHash).toBe(
      tokens.hashRefreshToken(second.refreshToken),
    );
    expect(second.session.revokedAt).toBeNull();
  });

  it("treats a second refresh with the previous token as a race", async () => {
    const { service } = createService();
    const first = await service.start("user-1");
    await service.rotate(first.refreshToken);

    await expect(service.rotate(first.refreshToken)).rejects.toBeInstanceOf(
      RotationInProgressError,
    );
  });

  it("treats the previous token as leaked once the grace window passed", async () => {
    let now = new Date("2026-10-14T00:00:00.000Z");
    const { stores, service } = createService({
      now: () => now,
      rotationGraceSeconds: 30,
    });
    const first = await service.start("user-1");
    const second = await service.rotate(first.refreshToken);
    now = new Date("2026-10-14T00:01:00.000Z");

    await expect(service.rotate(first.refreshToken)).rejects.toBeInstanceOf(
      SessionReuseError,
    );
    expect(stores.sessions.every((row) => row.revokedAt !== null)).toBe(true);
    await expect(service.rotate(second.refreshToken)).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
  });

  it("rejects an unknown refresh token", async () => {
    const { service } = createService();

    await expect(service.rotate("not-a-token")).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
  });

  it("rejects a token whose session was revoked by logout", async () => {
    const { service } = createService();
    const { refreshToken } = await service.start("user-1");
    await service.revokeByRefreshToken(refreshToken);

    await expect(service.rotate(refreshToken)).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
  });

  it("rejects a refresh token past the session expiry", async () => {
    let now = new Date("2026-10-14T00:00:00.000Z");
    const { service } = createService({ now: () => now, refreshTtlSeconds: 60 });
    const { refreshToken } = await service.start("user-1");
    now = new Date("2026-10-14T00:02:00.000Z");

    await expect(service.rotate(refreshToken)).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
  });

  it("reports only unrevoked, unexpired sessions as active", async () => {
    let now = new Date("2026-10-14T00:00:00.000Z");
    const { service } = createService({ now: () => now, refreshTtlSeconds: 60 });
    const { session, refreshToken } = await service.start("user-1");

    await expect(service.findActiveById(session.id)).resolves.toMatchObject({
      id: session.id,
    });

    await service.revokeByRefreshToken(refreshToken);
    await expect(service.findActiveById(session.id)).resolves.toBeNull();

    const expiring = await service.start("user-1");
    now = new Date("2026-10-14T00:02:00.000Z");
    await expect(service.findActiveById(expiring.session.id)).resolves.toBeNull();
  });

  it("revokes by refresh token and reports unknown tokens", async () => {
    const { service } = createService();
    const { session, refreshToken } = await service.start("user-1");

    await expect(service.revokeByRefreshToken(refreshToken)).resolves.toMatchObject(
      { id: session.id },
    );
    await expect(service.revokeByRefreshToken("unknown")).resolves.toBeNull();
  });
});
