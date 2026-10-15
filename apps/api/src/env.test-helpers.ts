import type { Env } from "./env";
import { cookiePolicyForProfile } from "./security/cookie";

export function createTestEnv(overrides: Partial<Env> = {}): Env {
  const environment = overrides.environment ?? "test";
  const publicBaseUrl = overrides.publicBaseUrl ?? "http://localhost:3000";

  return {
    environment,
    corsOrigins: ["http://localhost:3000"],
    port: 0,
    publicBaseUrl,
    problemTypeBase: `${publicBaseUrl}/problems`,
    requestBodyLimit: "1mb",
    databaseUrl: "postgresql://test:test@localhost:5432/btctu_test",
    jwtAccessSecret: "test-access-secret",
    jwtAccessIssuer: "btctu-api",
    jwtAccessAudience: "btctu-web",
    jwtAccessTtlSeconds: 900,
    refreshTokenTtlSeconds: 604800,
    cookiePolicy: cookiePolicyForProfile(environment, { secure: false }),
    auth: {
      loginMaxAttempts: 10,
      loginWindowSeconds: 60,
      rotationGraceSeconds: 30,
    },
    ...overrides,
  };
}
