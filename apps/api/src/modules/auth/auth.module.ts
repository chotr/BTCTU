import { createDatabase } from "@/db/client";
import type { Env } from "@/env";
import {
  MemoryLoginThrottle,
  type LoginThrottle,
} from "@/security/login-throttle";
import { HmacJwtTokenService } from "./access-token.service";
import { AuthService } from "./auth.service";
import type { AuthPort } from "./auth.types";
import { PasswordService } from "./password.service";
import { SessionRepository } from "./repositories/session.repository";
import { UserRepository } from "./repositories/user.repository";

export type AuthModule = {
  auth: AuthPort;
  throttle: LoginThrottle;
};

export type AuthModuleOverrides = {
  auth?: AuthPort;
  throttle?: LoginThrottle;
};

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
        accessTokens: new HmacJwtTokenService({
          secret: env.jwtAccessSecret,
          issuer: env.jwtAccessIssuer,
          audience: env.jwtAccessAudience,
          accessTtlSeconds: env.jwtAccessTtlSeconds,
        }),
        refreshTtlSeconds: env.refreshTokenTtlSeconds,
        rotationGraceSeconds: env.auth.rotationGraceSeconds,
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
      new MemoryLoginThrottle({
        maxAttempts: env.auth.loginMaxAttempts,
        windowMs: env.auth.loginWindowSeconds * 1000,
      }),
  };
}
