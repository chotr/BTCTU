import { describe, expect, it } from "vitest";
import app from "./index";

describe("BTCTU API", () => {
  it("returns health metadata", async () => {
    const response = await app.request("http://localhost/health", undefined, { ENVIRONMENT: "test", CORS_ORIGIN: "http://localhost:3000" });
    expect(response.status).toBe(200);
    expect((await response.json() as { status: string }).status).toBe("ok");
  });

  it("requires an actor for API routes", async () => {
    const response = await app.request("http://localhost/api/v1/me", undefined, { ENVIRONMENT: "test", CORS_ORIGIN: "http://localhost:3000" });
    expect(response.status).toBe(200);
    expect((await response.json() as { data: { id: string } }).data.id).toBe("u-leader");
  });

  it("denies a staff audit read", async () => {
    const response = await app.request("http://localhost/api/v1/audit", { headers: { "x-dev-user-id": "u-staff" } }, { ENVIRONMENT: "test", CORS_ORIGIN: "http://localhost:3000" });
    expect(response.status).toBe(403);
  });
});
