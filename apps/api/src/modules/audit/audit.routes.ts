import { Router } from "express";
import { can } from "@/middleware/authorization";
import { query } from "@/shared/request";
import { denyWithAudit } from "./audit.recorder";
import { ROLES, type Actor, type AuditEvent } from "@/types";

function canReadAuditEvent(
  actor: Actor,
  event: AuditEvent,
  tasks: { id: string; departmentId: string }[],
  evaluations: { id: string; departmentId: string }[],
): boolean {
  if (actor.role === ROLES.lanhDao) return true;
  if (actor.role === ROLES.truongPhong) {
    if (event.actorId === actor.id) return true;
    if (!actor.departmentId) return false;
    const task = tasks.find((t) => t.id === event.resource);
    if (task && task.departmentId === actor.departmentId) return true;
    const evaluation = evaluations.find((e) => e.id === event.resource);
    if (evaluation && evaluation.departmentId === actor.departmentId)
      return true;
    return false;
  }
  return false;
}

export function createAuditRouter(): Router {
  const router = Router();

  router.get("/audit", (req, res) => {
    const actor = req.actor!;
    if (!can(actor, { action: "audit.read" })) {
      denyWithAudit(
        req,
        res,
        "view_audit",
        "audit",
        "Staff cannot view the audit stream.",
      );
      return;
    }
    const outcome = query(req, "outcome");
    const state = req.state!;
    const data = req.state!.audit.filter(
      (event) =>
        canReadAuditEvent(actor, event, state.tasks, state.evaluations) &&
        (!outcome || event.outcome === outcome),
    );
    res.json({ data, meta: { total: data.length } });
  });

  return router;
}
