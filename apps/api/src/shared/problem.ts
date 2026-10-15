import type { ApiErrorCode, ProblemResponse } from "@btctu/shared";
import type { Application, Request, Response } from "express";
import type { ZodError } from "zod";

const FALLBACK_PROBLEM_TYPE_BASE = "https://btctu.local/problems";

export function configureProblemTypeBase(app: Application, base: string): void {
  app.locals.problemTypeBase = base;
}

function problemTypeBase(req: Request): string {
  const configured: unknown = req.app?.locals?.problemTypeBase;
  return typeof configured === "string" && configured !== ""
    ? configured
    : FALLBACK_PROBLEM_TYPE_BASE;
}

export function problem(
  req: Request,
  res: Response,
  status: number,
  title: string,
  detail: string,
  code: ApiErrorCode,
): Response {
  const body: ProblemResponse = {
    type: `${problemTypeBase(req)}/${code}`,
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
