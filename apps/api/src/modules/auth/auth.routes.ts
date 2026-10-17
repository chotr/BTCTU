import { Router, type Request, type Response } from "express";
import { createAccessTokenGuard } from "@/middleware/authentication";
import { createOriginGuard } from "@/middleware/csrf";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_COOKIE_PATH,
  type CookiePolicy,
  parseCookieHeader,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  serializeClearedCookie,
  serializeCookie,
  type CookieAttributes,
} from "@/security/cookie";
import type { LoginThrottle } from "@/security/login-throttle";
import { formatIssues, problem } from "@/shared/problem";
import { normalizeEmail } from "@/shared/string";
import {
  changePasswordRequestSchema,
  loginRequestSchema,
  refreshRequestSchema,
} from "./auth.schema";
import {
  AccountDisabledError,
  InvalidCurrentPasswordError,
  InvalidCredentialsError,
  InvalidSessionError,
  RotationInProgressError,
  SessionReuseError,
  type AuthPort,
  type AuthenticatedUser,
} from "./auth.types";

export type AuthRouterOptions = {
  auth: AuthPort;
  allowedOrigins: string[];
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
  cookiePolicy: CookiePolicy;
  throttle: LoginThrottle;
  accessCookieName?: string;
  accessCookiePath?: string;
  refreshCookieName?: string;
  refreshCookiePath?: string;
};

type TokenResponse = {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export function createAuthRouter(options: AuthRouterOptions): Router {
  const router = Router();
  const cookieName = options.refreshCookieName ?? REFRESH_COOKIE_NAME;
  const accessCookieName = options.accessCookieName ?? ACCESS_COOKIE_NAME;
  const accessCookie: CookieAttributes = {
    path: options.accessCookiePath ?? ACCESS_COOKIE_PATH,
    httpOnly: true,
    secure: options.cookiePolicy.secure,
    sameSite: options.cookiePolicy.sameSite,
  };
  const refreshCookie: CookieAttributes = {
    path: options.refreshCookiePath ?? REFRESH_COOKIE_PATH,
    httpOnly: true,
    secure: options.cookiePolicy.secure,
    sameSite: options.cookiePolicy.sameSite,
  };
  const originGuard = createOriginGuard(options.allowedOrigins);
  const requireAccessToken = createAccessTokenGuard(options.auth);
  const throttle = options.throttle;

  function setSessionCookies(res: Response, tokens: TokenResponse): void {
    res.setHeader("set-cookie", [
      serializeCookie(accessCookieName, tokens.accessToken, {
        ...accessCookie,
        maxAge: options.accessTtlSeconds,
      }),
      serializeCookie(cookieName, tokens.refreshToken, {
        ...refreshCookie,
        maxAge: options.refreshTtlSeconds,
      }),
    ]);
  }

  function clearSessionCookies(res: Response): void {
    res.setHeader("set-cookie", [
      serializeClearedCookie(accessCookieName, accessCookie),
      serializeClearedCookie(cookieName, refreshCookie),
    ]);
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
        expiresIn: tokens.expiresIn,
      },
      meta: {
        tokenStorage: "httpOnly-cookie",
        accessTokenCookie: accessCookieName,
        refreshTokenCookie: cookieName,
      },
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
    const decision = await throttle.check(attemptKey);
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
      await throttle.reset(attemptKey);
      setSessionCookies(res, result);
      respondWithTokens(res, result);
    } catch (error) {
      if (error instanceof InvalidCredentialsError) {
        await throttle.recordFailure(attemptKey);
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
        await throttle.recordFailure(attemptKey);
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
      clearSessionCookies(res);
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
      setSessionCookies(res, result);
      respondWithTokens(res, result);
    } catch (error) {
      if (error instanceof RotationInProgressError) {
        res.setHeader("retry-after", "1");
        problem(
          req,
          res,
          409,
          "Conflict",
          "Another refresh with the same token is in progress. Retry with the current cookie.",
          "refresh_in_progress",
        );
        return;
      }
      if (error instanceof SessionReuseError) {
        clearSessionCookies(res);
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
        clearSessionCookies(res);
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
        clearSessionCookies(res);
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

    clearSessionCookies(res);
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

  router.post(
    "/change-password",
    originGuard,
    requireAccessToken,
    async (req, res) => {
      const parsed = changePasswordRequestSchema.safeParse(req.body);
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

      try {
        await options.auth.changePassword(
          req.principal!,
          parsed.data.currentPassword,
          parsed.data.newPassword,
        );
        clearSessionCookies(res);
        res.status(204).end();
      } catch (error) {
        if (error instanceof InvalidCurrentPasswordError) {
          problem(
            req,
            res,
            401,
            "Unauthorized",
            "The current password is incorrect.",
            "invalid_current_password",
          );
          return;
        }
        if (error instanceof AccountDisabledError) {
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
    },
  );

  return router;
}
