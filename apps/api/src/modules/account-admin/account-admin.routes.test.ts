import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "@/app";
import type { User } from "@/db/schema";
import type { Env } from "@/env";
import { createWorkspaceState } from "@/mock-state";
import type { AuthPort } from "@/modules/auth/auth.types";
import type { AccountAdminPort } from "./account-admin.service";

const testEnv: Env = {
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

function user(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "user@btctu.local",
    directoryActorId: "p-nguyen-tran-thi",
    passwordHash: "not-returned",
    status: "ACTIVE",
    accountRole: "USER",
    mustChangePassword: false,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function authFor(accounts: User[]): AuthPort {
  return {
    login: async () => {
      throw new Error("not used");
    },
    refresh: async () => {
      throw new Error("not used");
    },
    logout: async () => undefined,
    authenticate: async (accessToken) => ({
      userId: accessToken,
      sessionId: "session-1",
    }),
    currentUser: async (principal) => {
      const account = accounts.find((item) => item.id === principal.userId);
      if (!account || account.status !== "ACTIVE") return null;
      return {
        id: account.id,
        email: account.email,
        status: account.status,
        accountRole: account.accountRole,
        mustChangePassword: account.mustChangePassword,
        directoryActorId: account.directoryActorId,
      };
    },
    changePassword: async () => undefined,
  };
}

function accountAdmin(accounts: User[]): AccountAdminPort {
  return {
    list: async () => accounts,
    findById: async (id) => accounts.find((item) => item.id === id) ?? null,
    create: vi.fn(async (input) =>
      user({
        id: "user-created",
        email: input.email.toLowerCase(),
        directoryActorId: input.directoryActorId,
        mustChangePassword: true,
      }),
    ),
    update: vi.fn(async (id, input) => {
      const target = accounts.find((item) => item.id === id);
      return target ? { ...target, ...input } : user();
    }),
    resetPassword: vi.fn(
      async (id) => accounts.find((item) => item.id === id)!,
    ),
    setAccountRole: vi.fn(async (id, accountRole) => {
      const target = accounts.find((item) => item.id === id)!;
      return { ...target, accountRole };
    }),
  };
}

describe("account administration routes", () => {
  it("rejects a regular account", async () => {
    const accounts = [user()];
    const app = createApp(testEnv, {
      auth: authFor(accounts),
      accountAdmin: accountAdmin(accounts),
    });

    const response = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", "Bearer user-1");

    expect(response.status).toBe(403);
  });

  it("creates an account only for a directory person", async () => {
    const state = createWorkspaceState();
    const admin = user({
      id: "admin-1",
      accountRole: "ACCOUNT_ADMIN",
      directoryActorId: "u-leader",
    });
    const accounts = [admin];
    const service = accountAdmin(accounts);
    const app = createApp(testEnv, {
      auth: authFor(accounts),
      accountAdmin: service,
      state,
    });

    const response = await request(app)
      .post("/api/v1/admin/users")
      .set("Authorization", "Bearer admin-1")
      .send({
        email: "new@btctu.local",
        directoryActorId: "p-nguyen-tran-thi",
        initialPassword: "temporary-password",
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      email: "new@btctu.local",
      directoryActorId: "p-nguyen-tran-thi",
      mustChangePassword: true,
    });
    expect(service.create).toHaveBeenCalledOnce();
  });

  it("reserves administrator grants for root", async () => {
    const standard = user({ id: "user-2", directoryActorId: "u-head" });
    const admin = user({
      id: "admin-1",
      accountRole: "ACCOUNT_ADMIN",
      directoryActorId: "u-leader",
    });
    const root = user({
      id: "root-1",
      email: "root@btctu.local",
      accountRole: "ROOT",
      directoryActorId: null,
    });
    const accounts = [standard, admin, root];
    const service = accountAdmin(accounts);

    const adminApp = createApp(testEnv, {
      auth: authFor(accounts),
      accountAdmin: service,
    });
    const denied = await request(adminApp)
      .put("/api/v1/admin/users/user-2/account-role")
      .set("Authorization", "Bearer admin-1")
      .send({ accountRole: "ACCOUNT_ADMIN" });
    expect(denied.status).toBe(403);

    const rootApp = createApp(testEnv, {
      auth: authFor(accounts),
      accountAdmin: service,
    });
    const granted = await request(rootApp)
      .put("/api/v1/admin/users/user-2/account-role")
      .set("Authorization", "Bearer root-1")
      .send({ accountRole: "ACCOUNT_ADMIN" });
    expect(granted.status).toBe(200);
    expect(service.setAccountRole).toHaveBeenCalledWith(
      "user-2",
      "ACCOUNT_ADMIN",
      expect.any(Object),
    );
  });
});
