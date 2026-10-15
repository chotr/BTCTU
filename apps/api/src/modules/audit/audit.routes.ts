import { Router } from "express";
import { can } from "@/middleware/authorization";
import { query } from "@/shared/request";
import { denyWithAudit } from "./audit.recorder";

export function createAuditRouter(): Router {
  const router = Router();

  router.get("/audit", (req, res) => {
    if (!can(req.actor!, { action: "audit.read" })) {
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
    const data = req.state!.audit.filter(
      (event) => !outcome || event.outcome === outcome,
    );
    res.json({ data, meta: { total: data.length } });
  });

  return router;
}
