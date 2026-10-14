import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "@/app";
import type { Env } from "@/env";
import { AttemptThrottle } from "@/security/throttle";
import { REFRESH_COOKIE_NAME } from "./auth.routes";
import { AuthService } from "./auth.service";
import { createInMemoryStores, createTestUser } from "./auth.test-helpers";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

const PASSWORD = "Route-Test-Password-1";
const EMAIL = "officer@btctu.local";
const ALLOWED_ORIGIN = "http://localhost:3000";

const env: Env = {
  environment: "test",
  corsOrigin: ALLOWED_ORIGIN,
  port: 0,
  databaseUrl: "postgresql://unused:unused@localhost:5432/unused",
  jwtAccessSecret: "route-test-secret",
  jwtAccessIssuer: "btctu-api",
  jwtAccessAudience: "btctu-web",
  jwtAccessTtlSeconds: 900,
  refreshTokenTtlSeconds: 604800,
};

async function createHarness(options: { maxAttempts?: number } = {}) {
  const stores = createInMemoryStores();
  const user = await createTestUser(stores, {
    email: EMAIL,
    password: PASSWORD,
  });
  const auth = new AuthService({
    users: stores.userStore,
    sessions: stores.sessionStore,
    passwords: new PasswordService(),
    tokens: new TokenService({
      accessSecret: env.jwtAccessSecret,
      issuer: env.jwtAccessIssuer,
      audience: env.jwtAccessAudience,
      accessTtlSeconds: env.jwtAccessTtlSeconds,
    }),
    refreshTtlSeconds: env.refreshTokenTtlSeconds,
  });
  const throttle = new AttemptThrottle({
    maxAttempts: options.maxAttempts ?? 10,
    windowMs: 60_000,
  });
  const app = createApp(env, { auth, throttle });

  return { app, stores, user };
}

function setCookieHeader(response: request.Response): string[] {
  const header = response.headers["set-cookie"];
  return Array.isArray(header) ? header : header ? [header] : [];
}

function refreshCookie(response: request.Response): string {
  const cookie = setCookieHeader(response).find((row) =>
    row.startsWith(`${REFRESH_COOKIE_NAME}=`),
  );
  if (!cookie) throw new Error("refresh cookie was not set");

  return cookie.split(";")[0];
}

async function login(app: ReturnType<typeof createApp>) {
  return request(app)
    .post("/api/v1/auth/login")
    .send({ email: EMAIL, password: PASSWORD });
}

function problemShape(body: Record<string, unknown>) {
  return { type: body.type, status: body.status, detail: body.detail };
}

describe("POST /api/v1/auth/login", () => {
  it("returns an access token and sets an httpOnly refresh cookie", async () => {
    const { app, user } = await createHarness();

    const response = await login(app);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual({
      id: user.id,
      email: EMAIL,
      status: "ACTIVE",
    });
    expect(response.body.data.expiresIn).toBe(900);
    expect(response.body.meta.tokenType).toBe("Bearer");
    const cookie = refreshCookie(response);
    expect(cookie).not.toBe(`${REFRESH_COOKIE_NAME}=`);
    expect(String(response.headers["set-cookie"])).toContain("HttpOnly");
    expect(String(response.headers["set-cookie"])).toContain(
      "Path=/api/v1/auth",
    );
    expect(response.body.data).not.toHaveProperty("refreshToken");
  });

  it("accepts the issued access token on the session endpoint", async () => {
    const { app, user } = await createHarness();
    const loginResponse = await login(app);

    const response = await request(app)
      .get("/api/v1/auth/session")
      .set("authorization", `Bearer ${loginResponse.body.data.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.id).toBe(user.id);
    expect(response.body.data.session.id).toEqual(expect.any(String));
  });

  it("rejects a body that does not match the contract", async () => {
    const { app } = await createHarness();

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email", password: "short" });

    expect(response.status).toBe(422);
    expect(response.body.type).toContain("validation_failed");
    expect(response.body.requestId).toEqual(expect.any(String));
    expect(response.body.detail).toContain("email");
  });

  it("answers unknown accounts and wrong passwords identically", async () => {
    const { app } = await createHarness();

    const wrongPassword = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: EMAIL, password: "Wrong-Password-1" });
    const unknownAccount = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "nobody@btctu.local", password: "Wrong-Password-1" });

    expect(wrongPassword.status).toBe(401);
    expect(unknownAccount.status).toBe(401);
    expect(wrongPassword.body.type).toContain("invalid_credentials");
    expect(problemShape(wrongPassword.body)).toEqual(
      problemShape(unknownAccount.body),
    );
  });

  it("reports a disabled account separately once the password matches", async () => {
    const { app, stores } = await createHarness();
    stores.users[0].status = "DISABLED";

    const response = await login(app);

    expect(response.status).toBe(403);
    expect(response.body.type).toContain("account_disabled");
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("blocks a request whose origin is not allowed", async () => {
    const { app } = await createHarness();

    const blocked = await request(app)
      .post("/api/v1/auth/login")
      .set("origin", "http://evil.example")
      .send({ email: EMAIL, password: PASSWORD });
    const allowed = await request(app)
      .post("/api/v1/auth/login")
      .set("origin", ALLOWED_ORIGIN)
      .send({ email: EMAIL, password: PASSWORD });

    expect(blocked.status).toBe(403);
    expect(blocked.body.type).toContain("origin_not_allowed");
    expect(allowed.status).toBe(200);
  });

  it("throttles repeated failures and answers 429", async () => {
    const { app } = await createHarness({ maxAttempts: 2 });
    const attempt = () =>
      request(app)
        .post("/api/v1/auth/login")
        .send({ email: EMAIL, password: "Wrong-Password-1" });

    expect((await attempt()).status).toBe(401);
    expect((await attempt()).status).toBe(401);
    const blocked = await attempt();

    expect(blocked.status).toBe(429);
    expect(blocked.body.type).toContain("too_many_attempts");
    expect(blocked.headers["retry-after"]).toEqual(expect.any(String));
  });
});

describe("POST /api/v1/auth/refresh", () => {
  it("rotates the cookie and invalidates the previous token", async () => {
    const { app } = await createHarness();
    const loginResponse = await login(app);
    const first = refreshCookie(loginResponse);

    const refreshed = await request(app)
      .post("/api/v1/auth/refresh")
      .set("cookie", first);

    expect(refreshed.status).toBe(200);
    const rotated = refreshCookie(refreshed);
    expect(rotated).not.toBe(first);
    await expect(
      request(app)
        .get("/api/v1/auth/session")
        .set("authorization", `Bearer ${refreshed.body.data.accessToken}`),
    ).resolves.toMatchObject({ status: 200 });

    const replay = await request(app)
      .post("/api/v1/auth/refresh")
      .set("cookie", first);
    expect(replay.status).toBe(401);
    expect(replay.body.type).toContain("refresh_token_reuse");

    const afterReuse = await request(app)
      .post("/api/v1/auth/refresh")
      .set("cookie", rotated);
    expect(afterReuse.status).toBe(401);
  });

  it("accepts the refresh token in the body for API clients", async () => {
    const { app } = await createHarness();
    const loginResponse = await login(app);
    const rawToken = refreshCookie(loginResponse).split("=")[1];

    const response = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: decodeURIComponent(rawToken) });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
  });

  it("requires a refresh token", async () => {
    const { app } = await createHarness();

    const response = await request(app).post("/api/v1/auth/refresh").send({});

    expect(response.status).toBe(401);
    expect(response.body.type).toContain("missing_refresh_token");
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("revokes the session and clears the cookie", async () => {
    const { app, stores } = await createHarness();
    const loginResponse = await login(app);
    const cookie = refreshCookie(loginResponse);

    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("cookie", cookie);

    expect(response.status).toBe(204);
    expect(String(response.headers["set-cookie"])).toContain("Max-Age=0");
    expect(stores.sessions.every((row) => row.revokedAt !== null)).toBe(true);

    const afterLogout = await request(app)
      .post("/api/v1/auth/refresh")
      .set("cookie", cookie);
    expect(afterLogout.status).toBe(401);
    // The logged-out token counts as replayed, so the whole family is revoked.
    expect(afterLogout.body.type).toContain("refresh_token_reuse");
  });
});

describe("GET /api/v1/auth/session", () => {
  it("denies a missing access token", async () => {
    const { app } = await createHarness();

    const response = await request(app).get("/api/v1/auth/session");

    expect(response.status).toBe(401);
    expect(response.body.type).toContain("missing_access_token");
  });

  it("denies a token that is not a signed access token", async () => {
    const { app } = await createHarness();

    const response = await request(app)
      .get("/api/v1/auth/session")
      .set("authorization", "Bearer not-a-jwt");

    expect(response.status).toBe(401);
    expect(response.body.type).toContain("invalid_access_token");
  });
});
