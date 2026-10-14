import type { Request, Response } from "express";
import type { ZodError } from "zod";

/** Probe comment added to test whether an external process strips comments. */
export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId: string;
};

export function problem(
  req: Request,
  res: Response,
  status: number,
  title: string,
  detail: string,
  code: string,
): Response {
  const body: ProblemDetails = {
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
