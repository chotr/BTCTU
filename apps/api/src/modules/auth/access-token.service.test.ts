import { decodeJwt, SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import { HmacJwtTokenService } from "./access-token.service";

const config = {
  secret: "unit-test-access-secret",
  issuer: "btctu-api",
  audience: "btctu-web",
  accessTtlSeconds: 900,
};

describe("HmacJwtTokenService", () => {
  it("issues a token that verifies back to its principal", async () => {
    const service = new HmacJwtTokenService(config);

    const token = await service.issueAccessToken("user-1", "session-1");

    await expect(service.verifyAccessToken(token)).resolves.toEqual({
      userId: "user-1",
      sessionId: "session-1",
    });
    expect(service.accessTtlSeconds).toBe(900);
  });

  it("encodes the configured lifetime as an expiry", async () => {
    const service = new HmacJwtTokenService(config);

    const claims = decodeJwt(await service.issueAccessToken("user-1", "s-1"));

    expect(Number(claims.exp) - Number(claims.iat)).toBe(900);
  });

  it("rejects a token signed with another secret", async () => {
    const foreign = new HmacJwtTokenService({
      ...config,
      secret: "another-secret",
    });
    const token = await foreign.issueAccessToken("user-1", "session-1");

    await expect(
      new HmacJwtTokenService(config).verifyAccessToken(token),
    ).rejects.toThrow();
  });

  it("rejects a token minted for another audience", async () => {
    const foreign = new HmacJwtTokenService({
      ...config,
      audience: "other-web",
    });
    const token = await foreign.issueAccessToken("user-1", "session-1");

    await expect(
      new HmacJwtTokenService(config).verifyAccessToken(token),
    ).rejects.toThrow();
  });

  it("rejects an expired token", async () => {
    const key = new TextEncoder().encode(config.secret);
    const expired = await new SignJWT({ sid: "session-1" })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject("user-1")
      .setIssuer(config.issuer)
      .setAudience(config.audience)
      .setIssuedAt(new Date(Date.now() - 7_200_000))
      .setExpirationTime(new Date(Date.now() - 3_600_000))
      .sign(key);

    await expect(
      new HmacJwtTokenService(config).verifyAccessToken(expired),
    ).rejects.toThrow();
  });
});
