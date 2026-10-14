import { describe, expect, it } from "vitest";
import { readEnv } from "./env";

const base = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/btctu",
  JWT_ACCESS_SECRET: "a-secret-long-enough",
};

describe("readEnv", () => {
  it("applies defaults for optional values", () => {
    expect(readEnv({ ...base })).toMatchObject({
      environment: "local",
      corsOrigin: "http://localhost:3000",
      port: 8787,
      jwtAccessIssuer: "btctu-api",
      jwtAccessAudience: "btctu-web",
      jwtAccessTtlSeconds: 900,
      refreshTokenTtlSeconds: 604800,
    });
  });

  it("rejects a database url that is not postgres", () => {
    expect(() =>
      readEnv({ ...base, DATABASE_URL: "mysql://localhost/btctu" }),
    ).toThrow(/postgres/);
  });

  it("rejects a port that is not an integer", () => {
    expect(() => readEnv({ ...base, PORT: "khong-phai-so" })).toThrow(
      /PORT must be an integer/,
    );
  });

  it("rejects a lifetime that is not positive", () => {
    expect(() => readEnv({ ...base, JWT_ACCESS_TTL_SECONDS: "0" })).toThrow(
      /JWT_ACCESS_TTL_SECONDS/,
    );
    expect(() => readEnv({ ...base, REFRESH_TOKEN_TTL_SECONDS: "-5" })).toThrow(
      /REFRESH_TOKEN_TTL_SECONDS/,
    );
  });

  it("demands a longer secret in production", () => {
    expect(() =>
      readEnv({
        ...base,
        ENVIRONMENT: "production",
        JWT_ACCESS_SECRET: "a".repeat(31),
      }),
    ).toThrow(/at least 32/);

    expect(
      readEnv({
        ...base,
        ENVIRONMENT: "production",
        JWT_ACCESS_SECRET: "a".repeat(32),
      }).environment,
    ).toBe("production");
  });

  it("requires the refresh lifetime to exceed the access lifetime", () => {
    expect(() =>
      readEnv({ ...base, JWT_ACCESS_TTL_SECONDS: "900", REFRESH_TOKEN_TTL_SECONDS: "600" }),
    ).toThrow(/greater than/);
  });

  it("rejects a relative cors origin", () => {
    expect(() => readEnv({ ...base, CORS_ORIGIN: "localhost:3000" })).toThrow(
      /absolute/,
    );
  });
});
