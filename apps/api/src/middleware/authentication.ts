import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { AuthPort } from "@/modules/auth/auth.types";
import {
  ACCESS_COOKIE_NAME,
  parseCookieHeader,
} from "@/security/cookie";
import { problem } from "@/shared/problem";

export function parseBearerToken(header: string | undefined): string | null {
  if (!header) return null;

  const [scheme, ...rest] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer") return null;

  const token = rest.join(" ").trim();
  return token.length > 0 ? token : null;
}

export function accessTokenFromRequest(
  req: Request,
  cookieName = ACCESS_COOKIE_NAME,
): string | null {
  const bearer = parseBearerToken(req.header("authorization"));
  if (bearer) return bearer;

  return parseCookieHeader(req.header("cookie"))[cookieName] ?? null;
}

export function createAccessTokenGuard(auth: AuthPort): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = accessTokenFromRequest(req);
    if (!token) {
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

    try {
      req.principal = await auth.authenticate(token);
    } catch {
      problem(
        req,
        res,
        401,
        "Unauthorized",
        "The access token is invalid or expired.",
        "invalid_access_token",
      );
      return;
    }

    next();
  };
}
