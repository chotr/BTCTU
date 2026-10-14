import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";
import { createTestEnv } from "./env.test-helpers";

const app = createApp(createTestEnv());

describe("BTCTU API", () => {
  it("returns health metadata", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("requires a development identity for API routes", async () => {
    const response = await request(app).get("/api/v1/me");

    expect(response.status).toBe(401);
    expect(response.body.type).toContain("unknown_actor");
  });

  it("returns the actor named by the development header", async () => {
    const response = await request(app)
      .get("/api/v1/me")
      .set("x-dev-user-id", "u-leader");

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
