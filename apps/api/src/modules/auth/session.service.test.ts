import { describe, expect, it } from "vitest";
import { createInMemoryStores } from "./auth.test-helpers";
import { InvalidSessionError, SessionReuseError } from "./auth.types";
import { SessionService } from "./session.service";
import { TokenService } from "./token.service";

const tokens = new TokenService({
  accessSecret: "session-service-secret",
  issuer: "btctu-api",
  audience: "btctu-web",
  accessTtlSeconds: 900,
});

function createService(
  options: { now?: () => Date; refreshTtlSeconds?: number } = {},
) {
  const stores = createInMemoryStores();
  const service = new SessionService({
    sessions: stores.sessionStore,
    tokens,
    refreshTtlSeconds: options.refreshTtlSeconds ?? 604800,
    now: options.now,
  });

  return { stores, service };
}

describe("SessionService", () => {
  it("stores only the hash of the refresh token", async () => {
    const { service } = createService();

    const { session, refreshToken } = await service.start("user-1");

    expect(session.refreshTokenHash).toBe(tokens.hashRefreshToken(refreshToken));
    expect(session.refreshTokenHash).not.toBe(refreshToken);
    expect(session.userId).toBe("user-1");
    expect(session.revokedAt).toBeNull();
  });

  it("rotates the refresh token and revokes the previous session", async () => {
    const { stores, service } = createService();
    const first = await service.start("user-1");

    const second = await service.rotate(first.refreshToken);

    expect(second.refreshToken).not.toBe(first.refreshToken);
    expect(second.session.id).not.toBe(first.session.id);
    expect(
      stores.sessions.find((row) => row.id === first.session.id)?.revokedAt,
    ).not.toBeNull();
  });

  it("rejects an unknown refresh token", async () => {
    const { service } = createService();

    await expect(service.rotate("not-a-token")).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
  });

  it("treats a replayed token as reuse and revokes every session", async () => {
    const { stores, service } = createService();
    const first = await service.start("user-1");
    await service.rotate(first.refreshToken);

    await expect(service.rotate(first.refreshToken)).rejects.toBeInstanceOf(
      SessionReuseError,
    );
    expect(stores.sessions).not.toHaveLength(0);
    expect(stores.sessions.every((row) => row.revokedAt !== null)).toBe(true);
  });

  it("rejects a refresh token that passed its expiry", async () => {
    let now = new Date("2026-10-14T00:00:00.000Z");
    const { service } = createService({
      now: () => now,
      refreshTtlSeconds: 60,
    });
    const { refreshToken } = await service.start("user-1");
    now = new Date("2026-10-14T00:02:00.000Z");

    await expect(service.rotate(refreshToken)).rejects.toBeInstanceOf(
      InvalidSessionError,
    );
  });

  it("revokes by refresh token and reports unknown tokens", async () => {
    const { stores, service } = createService();
    const { session, refreshToken } = await service.start("user-1");

    await expect(service.revokeByRefreshToken(refreshToken)).resolves.toMatchObject(
      { id: session.id },
    );
    expect(stores.sessions[0].revokedAt).not.toBeNull();
    await expect(service.revokeByRefreshToken("unknown")).resolves.toBeNull();
  });
});
