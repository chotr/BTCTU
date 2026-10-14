import { decodeJwt, SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { TokenService } from "./token.service";

const config = {
  accessSecret: "unit-test-access-secret",
  issuer: "btctu-api",
  audience: "btctu-web",
  accessTtlSeconds: 900,
};

describe("TokenService", () => {
  it("issues an access token that verifies back to its principal", async () => {
    const service = new TokenService(config);

    const token = await service.issueAccessToken("user-1", "session-1");

    await expect(service.verifyAccessToken(token)).resolves.toEqual({
      userId: "user-1",
      sessionId: "session-1",
    });
    expect(service.accessTtlSeconds).toBe(900);
  });

  it("encodes the configured lifetime as an expiry", async () => {
    const service = new TokenService(config);

    const claims = decodeJwt(await service.issueAccessToken("user-1", "s-1"));

    expect(Number(claims.exp) - Number(claims.iat)).toBe(900);
  });

  it("rejects a token signed with a different secret", async () => {
    const foreign = new TokenService({
      ...config,
      accessSecret: "another-secret",
    });
    const token = await foreign.issueAccessToken("user-1", "session-1");

    await expect(
      new TokenService(config).verifyAccessToken(token),
    ).rejects.toThrow();
  });

  it("rejects a token minted for another audience", async () => {
    const foreign = new TokenService({ ...config, audience: "another-web" });
    const token = await foreign.issueAccessToken("user-1", "session-1");

    await expect(
      new TokenService(config).verifyAccessToken(token),
    ).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const key = new TextEncoder().encode(config.accessSecret);
    const expired = await new SignJWT({ sid: "session-1" })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject("user-1")
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setIssuedAt(new Date(Date.now() - 7_200_000))
      .setExpirationTime(new Date(Date.now() - 3_600_000))
      .sign(key);

    await expect(
      new TokenService(config).verifyAccessToken(expired),
    ).rejects.toThrow();
  });

  it("stores refresh tokens only as deterministic hashes", () => {
    const service = new TokenService(config);
    const first = service.generateRefreshToken();
    const second = service.generateRefreshToken();

    expect(first).not.toBe(second);
    expect(service.hashRefreshToken(first)).toBe(
      service.hashRefreshToken(first),
    );
    expect(service.hashRefreshToken(first)).not.toBe(first);
    expect(service.hashRefreshToken(first)).not.toBe(
      service.hashRefreshToken(second),
    );
  });
});
