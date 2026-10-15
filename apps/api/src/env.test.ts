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
      corsOrigins: ["http://localhost:3000"],
      port: 8787,
      publicBaseUrl: "http://localhost:8787",
      problemTypeBase: "http://localhost:8787/problems",
      requestBodyLimit: "1mb",
      jwtAccessIssuer: "btctu-api",
      jwtAccessAudience: "btctu-web",
      jwtAccessTtlSeconds: 900,
      refreshTokenTtlSeconds: 604800,
      cookiePolicy: { secure: false, sameSite: "Strict" },
      auth: {
        loginMaxAttempts: 10,
        loginWindowSeconds: 60,
        rotationGraceSeconds: 30,
      },
    });
  });

  it("splits a comma separated origin list", () => {
    const env = readEnv({
      ...base,
      CORS_ORIGINS: "https://app.example.vn, https://admin.example.vn",
    });

    expect(env.corsOrigins).toEqual([
      "https://app.example.vn",
      "https://admin.example.vn",
    ]);
  });

  it("still accepts the single origin alias", () => {
    const env = readEnv({ ...base, CORS_ORIGIN: "https://app.example.vn" });

    expect(env.corsOrigins).toEqual(["https://app.example.vn"]);
  });

  it("rejects an origin that is not absolute", () => {
    expect(() =>
      readEnv({
        ...base,
        CORS_ORIGINS: "https://app.example.vn,localhost:3000",
      }),
    ).toThrow(/absolute/);
  });

  it("derives the problem type namespace from the public base url", () => {
    const env = readEnv({ ...base, PUBLIC_BASE_URL: "https://api.btctu.vn" });

    expect(env.problemTypeBase).toBe("https://api.btctu.vn/problems");
  });

  it("accepts an explicit problem type namespace and drops the trailing slash", () => {
    const env = readEnv({
      ...base,
      PROBLEM_TYPE_BASE: "https://docs.btctu.vn/problems/",
    });

    expect(env.problemTypeBase).toBe("https://docs.btctu.vn/problems");
  });

  it("rejects a problem type namespace that is not absolute", () => {
    expect(() => readEnv({ ...base, PROBLEM_TYPE_BASE: "/problems" })).toThrow(
      /PROBLEM_TYPE_BASE/,
    );
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

    const env = readEnv({
      ...base,
      ENVIRONMENT: "production",
      JWT_ACCESS_SECRET: "a".repeat(32),
    });
    expect(env.cookiePolicy).toEqual({ secure: true, sameSite: "Strict" });
  });

  it("requires the refresh lifetime to exceed the access lifetime", () => {
    expect(() =>
      readEnv({
        ...base,
        JWT_ACCESS_TTL_SECONDS: "900",
        REFRESH_TOKEN_TTL_SECONDS: "600",
      }),
    ).toThrow(/greater than/);
  });

  it("lets a deployment opt into cross-site cookies only with Secure", () => {
    expect(() =>
      readEnv({
        ...base,
        AUTH_COOKIE_SAME_SITE: "None",
        AUTH_COOKIE_SECURE: "false",
      }),
    ).toThrow(/requires AUTH_COOKIE_SECURE=true/);

    const env = readEnv({
      ...base,
      AUTH_COOKIE_SAME_SITE: "None",
      AUTH_COOKIE_SECURE: "true",
    });
    expect(env.cookiePolicy).toEqual({ secure: true, sameSite: "None" });
  });

  it("rejects an unknown SameSite value", () => {
    expect(() =>
      readEnv({ ...base, AUTH_COOKIE_SAME_SITE: "sometimes" }),
    ).toThrow(/AUTH_COOKIE_SAME_SITE/);
  });

  it("reads the auth policy overrides", () => {
    const env = readEnv({
      ...base,
      AUTH_LOGIN_MAX_ATTEMPTS: "3",
      AUTH_LOGIN_WINDOW_SECONDS: "120",
      AUTH_REFRESH_ROTATION_GRACE_SECONDS: "0",
    });

    expect(env.auth).toEqual({
      loginMaxAttempts: 3,
      loginWindowSeconds: 120,
      rotationGraceSeconds: 0,
    });
  });

  it("rejects an attempt limit below one", () => {
    expect(() => readEnv({ ...base, AUTH_LOGIN_MAX_ATTEMPTS: "0" })).toThrow(
      /AUTH_LOGIN_MAX_ATTEMPTS/,
    );
  });
});
