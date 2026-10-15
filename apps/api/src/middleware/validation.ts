import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ZodTypeAny } from "zod";
import { formatIssues, problem } from "@/shared/problem";

// Khuôn kiểm body dùng chung: sai contract thì trả 422 problem + json kèm danh sách lỗi, đúng thì để handler đọc qua `req.validated`.
export function validate(schema: ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const detail = formatIssues(result.error);
      problem(req, res, 422, "Validation failed", detail, "validation_failed");
      return;
    }
    req.validated = result.data;
    next();
  };
}
