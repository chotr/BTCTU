import type { NextFunction, Request, RequestHandler, Response } from "express";
import { normalizeOrigin } from "@/security/origin";
import { validExternalRequestId } from "@/shared/request-id";

const ALLOWED_HEADERS =
  "content-type, x-dev-user-id, x-request-id, authorization";
const ALLOWED_METHODS = "GET,POST,OPTIONS";

export type RequestContextOptions = {
  allowedOrigins: string[];
};

// Gắn mã tương quan, header bảo mật và CORS cho mọi phản hồi. Chạy trước khi vào router nghiệp vụ nên mọi lỗi phía sau đều có request id để đối chiếu.
export function createRequestContext(
  options: RequestContextOptions,
): RequestHandler {
  const allowedOrigins = new Set(options.allowedOrigins.map(normalizeOrigin));

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId =
      validExternalRequestId(req.header("x-request-id")) ?? crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    res.setHeader("x-content-type-options", "nosniff");
    res.setHeader("referrer-policy", "no-referrer");

    const origin = req.header("origin");
    if (origin && allowedOrigins.has(normalizeOrigin(origin))) {
      res.setHeader("access-control-allow-origin", origin);
      res.setHeader("access-control-allow-credentials", "true");
      res.setHeader("vary", "Origin");
    }
    res.setHeader("access-control-allow-headers", ALLOWED_HEADERS);
    res.setHeader("access-control-allow-methods", ALLOWED_METHODS);
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  };
}
