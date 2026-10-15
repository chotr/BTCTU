import type { Request, Response } from "express";
import { problem } from "@/shared/problem";

export function recordAudit(
  req: Request,
  action: string,
  resource: string,
  outcome: "OK" | "DENIED",
  detail = "",
): void {
  const state = req.state!;
  const actor = req.actor!;
  state.audit.unshift({
    id: `aud-${crypto.randomUUID()}`,
    requestId: req.requestId,
    actorId: actor.id,
    action,
    resource,
    outcome,
    detail,
    at: new Date().toISOString(),
  });
}

// Từ chối kèm một dòng vết DENIED, để mọi lần chặn quyền đều để lại dấu.
export function denyWithAudit(
  req: Request,
  res: Response,
  action: string,
  resource: string,
  detail: string,
): void {
  recordAudit(req, action, resource, "DENIED", detail);
  problem(req, res, 403, "Forbidden", detail, "forbidden");
}
