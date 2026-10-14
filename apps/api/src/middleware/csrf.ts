import type { NextFunction, Request, RequestHandler, Response } from "express";
import { isOriginAllowed } from "@/security/origin";
import { problem } from "@/shared/problem";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function createOriginGuard(allowedOrigins: string[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    if (isOriginAllowed(req.header("origin"), allowedOrigins)) {
      next();
      return;
    }

    problem(
      req,
      res,
      403,
      "Forbidden",
      "This request origin is not allowed for the endpoint.",
      "origin_not_allowed",
    );
  };
}
