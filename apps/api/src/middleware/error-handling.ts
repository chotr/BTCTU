import type { NextFunction, Request, Response } from "express";
import { problem } from "@/shared/problem";

export function notFoundHandler(req: Request, res: Response): void {
  problem(
    req,
    res,
    404,
    "Not found",
    "Route does not exist.",
    "route_not_found",
  );
}

export function errorHandler(
  error: Error & { status?: number; body?: unknown },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    problem(
      req,
      res,
      400,
      "Bad request",
      "Request body is not valid JSON.",
      "invalid_json",
    );
    return;
  }

  console.error(
    JSON.stringify({
      requestId: req.requestId,
      path: req.path,
      error: error.message,
    }),
  );
  problem(
    req,
    res,
    500,
    "Internal server error",
    "The server could not complete the request.",
    "internal_error",
  );
}
