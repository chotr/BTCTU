import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import type { Env } from "./env";

const env: Env = {
  environment: "test",
  corsOrigin: "http://localhost:3000",
  port: 0,
  databaseUrl: "postgresql://test:test@localhost:5432/btctu_test",
  jwtAccessSecret: "test-access-secret",
  jwtAccessIssuer: "btctu-api",
  jwtAccessAudience: "btctu-web",
  jwtAccessTtlSeconds: 900,
  refreshTokenTtlSeconds: 604800,
};
const app = createApp(env);

describe("BTCTU API", () => {
  it("returns health metadata", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("requires an actor for API routes", async () => {
    const response = await request(app).get("/api/v1/me");
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe("u-leader");
  });

  it("denies a staff audit read", async () => {
    const response = await request(app)
      .get("/api/v1/audit")
      .set("x-dev-user-id", "u-staff");
    expect(response.status).toBe(403);
  });
});
