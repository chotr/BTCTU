import { Router, type Request, type Response } from "express";
import { createAccessTokenGuard } from "@/middleware/authentication";
import { createOriginGuard } from "@/middleware/csrf";
import {
  parseCookieHeader,
  serializeClearedCookie,
  serializeCookie,
  type CookieAttributes,
} from "@/security/cookie";
import { AttemptThrottle } from "@/security/throttle";
import { formatIssues, problem } from "@/shared/problem";
import { normalizeEmail } from "@/shared/string";
import { loginRequestSchema, refreshRequestSchema } from "./auth.schema";
import {
  AccountDisabledError,
  InvalidCredentialsError,
  InvalidSessionError,
  SessionReuseError,
  type AuthPort,
  type AuthenticatedUser,
} from "./auth.types";

export const REFRESH_COOKIE_NAME = "btctu_refresh";
export const REFRESH_COOKIE_PATH = "/api/v1/auth";

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 60_000;

export type AuthRouterOptions = {
  auth: AuthPort;
  allowedOrigins: string[];
  refreshTtlSeconds: number;
  secureCookies?: boolean;
  refreshCookieName?: string;
  refreshCookiePath?: string;
  throttle?: AttemptThrottle;
};

type TokenResponse = {
  user: AuthenticatedUser;
  accessToken: string;
  expiresIn: number;
  refreshTokenExpiresAt: Date;
};

export function createAuthRouter(options: AuthRouterOptions): Router {
  const router = Router();
  const cookieName = options.refreshCookieName ?? REFRESH_COOKIE_NAME;
  const cookieAttributes: CookieAttributes = {
    path: options.refreshCookiePath ?? REFRESH_COOKIE_PATH,
    httpOnly: true,
    secure: options.secureCookies ?? false,
    sameSite: "Strict",
  };
  const originGuard = createOriginGuard(options.allowedOrigins);
  const requireAccessToken = createAccessTokenGuard(options.auth);
  const throttle =
    options.throttle ??
    new AttemptThrottle({
      maxAttempts: LOGIN_MAX_ATTEMPTS,
      windowMs: LOGIN_WINDOW_MS,
    });

  function setRefreshCookie(res: Response, refreshToken: string): void {
    res.setHeader(
      "set-cookie",
      serializeCookie(cookieName, refreshToken, {
        ...cookieAttributes,
        maxAge: options.refreshTtlSeconds,
      }),
    );
  }

  function clearRefreshCookie(res: Response): void {
    res.setHeader(
      "set-cookie",
      serializeClearedCookie(cookieName, cookieAttributes),
    );
  }

  function readRefreshToken(
    req: Request,
    bodyToken: string | undefined,
  ): string | undefined {
    if (bodyToken) return bodyToken;
    return parseCookieHeader(req.header("cookie"))[cookieName];
  }

  function respondWithTokens(res: Response, tokens: TokenResponse): void {
    res.json({
      data: {
        user: tokens.user,
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
        refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString(),
      },
      meta: { tokenType: "Bearer" },
    });
  }

  router.post("/login", originGuard, async (req, res) => {
    const parsed = loginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        formatIssues(parsed.error),
        "validation_failed",
      );
      return;
    }

    const attemptKey = `${normalizeEmail(parsed.data.email)}|${req.ip ?? "unknown"}`;
    const decision = throttle.check(attemptKey);
    if (!decision.allowed) {
      res.setHeader("retry-after", String(decision.retryAfterSeconds));
      problem(
        req,
        res,
        429,
        "Too many attempts",
        "Too many failed sign-in attempts. Try again later.",
        "too_many_attempts",
      );
      return;
    }

    try {
      const result = await options.auth.login(parsed.data);
      throttle.reset(attemptKey);
      setRefreshCookie(res, result.refreshToken);
      respondWithTokens(res, result);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        throttle.recordFailure(attemptKey);
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "Email or password is incorrect.",
          "invalid_credentials",
        );
        return;
      }
      if (error instanceof AccountDisabledError) {
        throttle.recordFailure(attemptKey);
        problem(
          req,
          res,
          403,
          "Forbidden",
          "This account is disabled.",
          "account_disabled",
        );
        return;
      }
      throw error;
    }
  });

  router.post("/refresh", originGuard, async (req, res) => {
    const parsed = refreshRequestSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        formatIssues(parsed.error),
        "validation_failed",
      );
      return;
    }

    const refreshToken = readRefreshToken(req, parsed.data.refreshToken);
    if (!refreshToken) {
      clearRefreshCookie(res);
      problem(
        req,
        res,
        401,
        "Unauthorized",
        "A refresh token is required.",
        "missing_refresh_token",
      );
      return;
    }

    try {
      const result = await options.auth.refresh(refreshToken);
      setRefreshCookie(res, result.refreshToken);
      respondWithTokens(res, result);
    } catch (error) {
      if (error instanceof SessionReuseError) {
        clearRefreshCookie(res);
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "This refresh token was already used; every session of the account was revoked.",
          "refresh_token_reuse",
        );
        return;
      }
      if (error instanceof InvalidSessionError) {
        clearRefreshCookie(res);
        problem(
          req,
          res,
          401,
          "Unauthorized",
          "The refresh token is invalid or expired.",
          "invalid_refresh_token",
        );
        return;
      }
      if (error instanceof AccountDisabledError) {
        clearRefreshCookie(res);
        problem(
          req,
          res,
          403,
          "Forbidden",
          "This account is disabled.",
          "account_disabled",
        );
        return;
      }
      throw error;
    }
  });

  router.post("/logout", originGuard, async (req, res) => {
    const parsed = refreshRequestSchema.safeParse(req.body ?? {});
    const refreshToken = readRefreshToken(
      req,
      parsed.success ? parsed.data.refreshToken : undefined,
    );

    clearRefreshCookie(res);
    if (refreshToken) await options.auth.logout(refreshToken);
    res.status(204).end();
  });

  router.get("/session", requireAccessToken, async (req, res) => {
    const principal = req.principal;
    if (!principal) {
      problem(
        req,
        res,
        401,
        "Unauthorized",
        "An access token is required.",
        "missing_access_token",
      );
      return;
    }

    const user = await options.auth.currentUser(principal);
    if (!user) {
      problem(
        req,
        res,
        401,
        "Unauthorized",
        "The account behind this session is no longer active.",
        "inactive_account",
      );
      return;
    }

    res.json({
      data: { user, session: { id: principal.sessionId } },
      meta: { identityMode: "access-token" },
    });
  });

  return router;
}
