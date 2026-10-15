import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { can } from "@/middleware/authorization";
import { validate } from "@/middleware/validation";
import { denyWithAudit, recordAudit } from "@/modules/audit/audit.recorder";
import { problem } from "@/shared/problem";
import { query } from "@/shared/request";
import {
  decisionSchema,
  reviewSchema,
  selfEvaluationSchema,
} from "./evaluation.schema";

function evaluationNotFound(req: Request, res: Response): void {
  problem(
    req,
    res,
    404,
    "Not found",
    "Evaluation does not exist.",
    "evaluation_not_found",
  );
}

export function createEvaluationRouter(): Router {
  const router = Router();

  router.get("/evaluations", (req, res) => {
    const periodId = query(req, "periodId");
    const status = query(req, "status");
    const data = req.state!.evaluations.filter(
      (evaluation) =>
        (!periodId || evaluation.periodId === periodId) &&
        (!status || evaluation.status === status),
    );
    res.json({ data, meta: { total: data.length } });
  });

  router.get("/evaluations/:id", (req, res) => {
    const evaluation = req.state!.evaluations.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!evaluation) {
      evaluationNotFound(req, res);
      return;
    }
    res.json({
      data: evaluation,
      meta: {
        formulaNote:
          "05-HD/TU has a worked-example arithmetic inconsistency; the configured rule remains subject to approval.",
      },
    });
  });

  router.post(
    "/evaluations/:id/self",
    validate(selfEvaluationSchema),
    (req, res) => {
      const actor = req.actor!;
      const evaluation = req.state!.evaluations.find(
        (candidate) => candidate.id === req.params.id,
      );
      if (!evaluation) {
        evaluationNotFound(req, res);
        return;
      }
      if (
        !can(actor, {
          action: "evaluation.self",
          resource: { subjectId: evaluation.subjectId },
        })
      ) {
        denyWithAudit(
          req,
          res,
          "self_evaluate",
          evaluation.id,
          "Only the evaluation subject can submit self-evaluation.",
        );
        return;
      }
      const input = req.validated as z.infer<typeof selfEvaluationSchema>;
      evaluation.status = "SUBMITTED";
      evaluation.selfComment = input.comment;
      evaluation.classification = input.proposed;
      recordAudit(req, "self_evaluate", evaluation.id, "OK");
      res.json({ data: evaluation });
    },
  );

  router.post("/evaluations/:id/review", validate(reviewSchema), (req, res) => {
    const actor = req.actor!;
    const evaluation = req.state!.evaluations.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!evaluation) {
      evaluationNotFound(req, res);
      return;
    }
    if (
      !can(actor, {
        action: "evaluation.review",
        resource: { departmentId: evaluation.departmentId },
      })
    ) {
      denyWithAudit(
        req,
        res,
        "review_evaluation",
        evaluation.id,
        "Actor cannot review this department.",
      );
      return;
    }
    const input = req.validated as z.infer<typeof reviewSchema>;
    evaluation.status = input.action === "propose" ? "REVIEWED" : "DRAFT";
    evaluation.reviewComment = input.comment;
    evaluation.classification = input.proposed;
    recordAudit(
      req,
      input.action === "propose" ? "review_evaluation" : "return_evaluation",
      evaluation.id,
      "OK",
      input.comment,
    );
    res.json({ data: evaluation });
  });

  router.post(
    "/evaluations/:id/decision",
    validate(decisionSchema),
    (req, res) => {
      const actor = req.actor!;
      const evaluation = req.state!.evaluations.find(
        (candidate) => candidate.id === req.params.id,
      );
      if (!evaluation) {
        evaluationNotFound(req, res);
        return;
      }
      if (!can(actor, { action: "evaluation.decide" })) {
        denyWithAudit(
          req,
          res,
          "decide_evaluation",
          evaluation.id,
          "Only the competent authority can decide.",
        );
        return;
      }
      const input = req.validated as z.infer<typeof decisionSchema>;
      evaluation.status = "APPROVED";
      evaluation.classification = input.classification;
      evaluation.decisionNote = input.note;
      recordAudit(req, "decide_evaluation", evaluation.id, "OK", input.note);
      res.json({ data: evaluation });
    },
  );

  router.post("/periods/:id/lock", (req, res) => {
    const actor = req.actor!;
    const state = req.state!;
    const period = state.periods.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!period) {
      problem(
        req,
        res,
        404,
        "Not found",
        "Period does not exist.",
        "period_not_found",
      );
      return;
    }
    if (!can(actor, { action: "period.lock" })) {
      denyWithAudit(
        req,
        res,
        "lock_period",
        period.id,
        "Only the competent authority can lock a period.",
      );
      return;
    }
    period.lockedAt = new Date().toISOString();
    for (const evaluation of state.evaluations.filter(
      (candidate) =>
        candidate.periodId === period.id && candidate.status === "APPROVED",
    )) {
      evaluation.status = "LOCKED";
    }
    recordAudit(req, "lock_period", period.id, "OK");
    res.json({ data: period });
  });

  return router;
}
