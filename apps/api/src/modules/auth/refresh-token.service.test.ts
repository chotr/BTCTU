import { describe, expect, it } from "vitest";
import { RefreshTokenService } from "./refresh-token.service";

describe("RefreshTokenService", () => {
  it("generates distinct 256-bit tokens", () => {
    const service = new RefreshTokenService();

    const tokens = new Set(
      Array.from({ length: 50 }, () => service.generate()),
    );

    expect(tokens.size).toBe(50);
    for (const token of tokens) {
      expect(Buffer.from(token, "base64url")).toHaveLength(32);
    }
  });

  it("hashes deterministically without returning the raw token", () => {
    const service = new RefreshTokenService();
    const token = service.generate();

    const hash = service.hash(token);

    expect(hash).toBe(service.hash(token));
    expect(hash).not.toBe(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(service.hash(service.generate())).not.toBe(hash);
  });
});
