import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import type { Env } from "@/env";
import type { AuthPort } from "@/modules/auth/auth.types";
import { ACCESS_COOKIE_NAME } from "@/security/cookie";

const productionEnv: Env = {
  environment: "production",
  corsOrigins: ["https://btctu.example"],
  port: 8787,
  publicBaseUrl: "https://api.btctu.example",
  problemTypeBase: "https://api.btctu.example/problems",
  requestBodyLimit: "1mb",
  databaseUrl: "postgres://unused",
  jwtAccessSecret: "access-secret-that-is-at-least-32-chars-long",
  jwtAccessIssuer: "btctu:test",
  jwtAccessAudience: "btctu:test",
  jwtAccessTtlSeconds: 900,
  refreshTokenTtlSeconds: 604800,
  cookiePolicy: { secure: true, sameSite: "Strict" },
  auth: {
    loginMaxAttempts: 5,
    loginWindowSeconds: 900,
    rotationGraceSeconds: 15,
  },
};

function authWithDirectoryActor(directoryActorId: string): AuthPort {
  return {
    login: async () => {
      throw new Error("not used");
    },
    refresh: async () => {
      throw new Error("not used");
    },
    logout: async () => undefined,
    authenticate: async () => ({
      userId: "account-uuid",
      sessionId: "session-uuid",
    }),
    currentUser: async () => ({
      id: "account-uuid",
      email: "staff@btctu.local",
      status: "ACTIVE",
      accountRole: "USER",
      mustChangePassword: false,
      directoryActorId,
    }),
    changePassword: async () => undefined,
  };
}

describe("production actor identity", () => {
  it("resolves an authenticated account through its directory actor id", async () => {
    const app = createApp(productionEnv, {
      auth: authWithDirectoryActor("p-nguyen-tran-thi"),
    });

    const response = await request(app)
      .get("/api/v1/me")
      .set("Cookie", `${ACCESS_COOKIE_NAME}=valid-access-token`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: "p-nguyen-tran-thi",
      role: "truong_phong",
    });
  });

  it("rejects a production request without an access cookie", async () => {
    const app = createApp(productionEnv, {
      auth: authWithDirectoryActor("p-nguyen-tran-thi"),
    });

    const response = await request(app).get("/api/v1/me");

    expect(response.status).toBe(401);
    expect(response.body.type).toContain("missing_access_token");
  });

  it("does not grant a root account business access without a directory actor", async () => {
    const rootAuth: AuthPort = {
      ...authWithDirectoryActor("unused"),
      currentUser: async () => ({
        id: "root-uuid",
        email: "root@example.test",
        status: "ACTIVE",
        accountRole: "ROOT",
        mustChangePassword: false,
        directoryActorId: null,
      }),
    };

    const app = createApp(productionEnv, { auth: rootAuth });
    const response = await request(app)
      .get("/api/v1/me")
      .set("Cookie", `${ACCESS_COOKIE_NAME}=valid-access-token`);

    expect(response.status).toBe(403);
    expect(response.body.type).toContain("actor_not_provisioned");
  });
});
