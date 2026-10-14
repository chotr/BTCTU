import { createDatabase } from "@/db/client";
import type { Env } from "@/env";
import { AttemptThrottle } from "@/security/throttle";
import { AuthService } from "./auth.service";
import type { AuthPort } from "./auth.types";
import { PasswordService } from "./password.service";
import { SessionRepository } from "./repositories/session.repository";
import { UserRepository } from "./repositories/user.repository";
import { TokenService } from "./token.service";

export type AuthModule = {
  auth: AuthPort;
  throttle: AttemptThrottle;
};

export type AuthModuleOverrides = {
  auth?: AuthPort;
  throttle?: AttemptThrottle;
};

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_SECONDS = 60;

export function createAuthModule(
  env: Env,
  overrides: AuthModuleOverrides = {},
): AuthModule {
  let service: AuthPort | null = null;

  const resolve = (): AuthPort => {
    if (!service) {
      const db = createDatabase(env.databaseUrl);
      service = new AuthService({
        users: new UserRepository(db),
        sessions: new SessionRepository(db),
        passwords: new PasswordService(),
        tokens: new TokenService({
          accessSecret: env.jwtAccessSecret,
          issuer: env.jwtAccessIssuer,
          audience: env.jwtAccessAudience,
          accessTtlSeconds: env.jwtAccessTtlSeconds,
        }),
        refreshTtlSeconds: env.refreshTokenTtlSeconds,
        onEvent: (event) =>
          console.info(JSON.stringify({ scope: "auth", ...event })),
      });
    }
    return service;
  };

  const auth: AuthPort = overrides.auth ?? {
    login: (input) => resolve().login(input),
    refresh: (token) => resolve().refresh(token),
    logout: (token) => resolve().logout(token),
    authenticate: (token) => resolve().authenticate(token),
    currentUser: (principal) => resolve().currentUser(principal),
  };

  return {
    auth,
    throttle:
      overrides.throttle ??
      new AttemptThrottle({
        maxAttempts: LOGIN_MAX_ATTEMPTS,
        windowMs: LOGIN_WINDOW_SECONDS * 1000,
      }),
  };
}
