import type { ProblemResponse } from "@btctu/shared";
import type { Request, Response } from "express";
import type { ZodError } from "zod";

/**
 * RFC 9457 style problem response shared by every route. `code` is the stable
 * machine-readable identifier clients switch on.
 */
export function problem(
  req: Request,
  res: Response,
  status: number,
  title: string,
  detail: string,
  code: string,
): Response {
  const body: ProblemResponse = {
    type: `https://btctu.local/problems/${code}`,
    title,
    status,
    detail,
    instance: req.path,
    requestId: req.requestId,
  };

  return res.status(status).json(body);
}

export function formatIssues(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
    .join("; ");
}
