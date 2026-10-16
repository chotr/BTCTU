import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { can, canReadTask } from "@/middleware/authorization";
import { validate } from "@/middleware/validation";
import { denyWithAudit, recordAudit } from "@/modules/audit/audit.recorder";
import { query } from "@/shared/request";
import { problem } from "@/shared/problem";
import type { Task } from "@/types";
import { createTaskSchema, resultSchema, returnSchema } from "./task.schema";

function nextTaskId(): string {
  return `NV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function nextStatusForTask(task: Task, submit: boolean): Task["status"] {
  if (submit) return "SUBMITTED";
  return task.status === "ASSIGNED" ? "IN_PROGRESS" : task.status;
}

function taskNotFound(req: Request, res: Response): void {
  problem(req, res, 404, "Not found", "Task does not exist.", "task_not_found");
}

function findPeriod(req: Request, periodId?: string) {
  if (!periodId) return undefined;
  return req.state!.periods.find((p) => p.id === periodId);
}

function isPeriodLocked(req: Request, periodId?: string): boolean {
  const period = findPeriod(req, periodId);
  return Boolean(period?.lockedAt);
}

export function createTaskRouter(): Router {
  const router = Router();

  router.get("/tasks", (req, res) => {
    const actor = req.actor!;
    const status = query(req, "status");
    const departmentId = query(req, "departmentId");
    const q = query(req, "q")?.toLowerCase();
    const data = req.state!.tasks.filter(
      (task) =>
        canReadTask(actor, task) &&
        (!status || task.status === status) &&
        (!departmentId || task.departmentId === departmentId) &&
        (!q || `${task.id} ${task.title}`.toLowerCase().includes(q)),
    );
    res.json({ data, meta: { total: data.length } });
  });

  router.post("/tasks", validate(createTaskSchema), (req, res) => {
    const state = req.state!;
    const actor = req.actor!;
    const input = req.validated as z.infer<typeof createTaskSchema>;
    const assignee = state.people.find(
      (person) => person.id === input.assigneeId,
    );
    const catalog = state.catalog.find(
      (item) => item.id === input.catalogItemId,
    );
    if (!assignee || !catalog) {
      problem(
        req,
        res,
        422,
        "Validation failed",
        "assigneeId or catalogItemId does not exist.",
        "invalid_reference",
      );
      return;
    }
    if (
      !can(actor, {
        action: "task.create",
        resource: { departmentId: assignee.departmentId },
      })
    ) {
      denyWithAudit(
        req,
        res,
        "create_task",
        input.title,
        "Actor cannot assign work in this department.",
      );
      return;
    }

    if (input.periodId) {
      const period = findPeriod(req, input.periodId);
      if (!period) {
        problem(
          req,
          res,
          422,
          "Validation failed",
          "periodId does not exist.",
          "invalid_reference",
        );
        return;
      }
      if (period.lockedAt) {
        problem(
          req,
          res,
          409,
          "Conflict",
          "Cannot create task in a locked period.",
          "period_locked",
        );
        return;
      }
    }

    const task: Task = {
      id: nextTaskId(),
      title: input.title,
      description: input.description,
      catalogItemId: input.catalogItemId,
      departmentId: assignee.departmentId,
      assigneeId: assignee.id,
      assignerId: actor.id,
      periodId: input.periodId,
      plannedQuantity: input.plannedQuantity ?? 1,
      dueAt: input.dueAt,
      status: "ASSIGNED",
      progress: 0,
      result: null,
    };
    state.tasks.unshift(task);
    recordAudit(
      req,
      "create_task",
      task.id,
      "SUCCESS",
      `Assigned to ${assignee.name}`,
    );
    res.status(201).json({ data: task });
  });

  router.get("/tasks/:id", (req, res) => {
    const actor = req.actor!;
    const task = req.state!.tasks.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!task || !canReadTask(actor, task)) {
      taskNotFound(req, res);
      return;
    }
    res.json({ data: task });
  });

  router.post("/tasks/:id/result", validate(resultSchema), (req, res) => {
    const actor = req.actor!;
    const task = req.state!.tasks.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!task) {
      taskNotFound(req, res);
      return;
    }
    if (isPeriodLocked(req, task.periodId)) {
      problem(
        req,
        res,
        409,
        "Conflict",
        "Cannot modify task in a locked period.",
        "period_locked",
      );
      return;
    }
    if (task.status === "SUBMITTED" || task.status === "ACCEPTED") {
      problem(
        req,
        res,
        409,
        "Conflict",
        `Cannot update result when task is already ${task.status}.`,
        "invalid_task_status",
      );
      return;
    }
    if (actor.id !== task.assigneeId) {
      denyWithAudit(
        req,
        res,
        "save_task_result",
        task.id,
        "Only the assignee can save a result.",
      );
      return;
    }
    const input = req.validated as z.infer<typeof resultSchema>;
    task.result = {
      quantity: input.quantity,
      product: input.product,
      qualityLevel: input.qualityLevel,
      note: input.note,
      submittedAt: input.submit ? new Date().toISOString() : null,
    };
    task.progress = input.submit ? 100 : Math.max(task.progress, 1);
    task.status = nextStatusForTask(task, input.submit);
    recordAudit(
      req,
      input.submit ? "submit_task_result" : "save_task_result",
      task.id,
      "SUCCESS",
    );
    res.json({ data: task });
  });

  router.post("/tasks/:id/accept", (req, res) => {
    const actor = req.actor!;
    const task = req.state!.tasks.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!task) {
      taskNotFound(req, res);
      return;
    }
    if (isPeriodLocked(req, task.periodId)) {
      problem(
        req,
        res,
        409,
        "Conflict",
        "Cannot accept task in a locked period.",
        "period_locked",
      );
      return;
    }
    if (task.status !== "SUBMITTED") {
      problem(
        req,
        res,
        409,
        "Conflict",
        `Cannot accept task with status ${task.status}. Task must be SUBMITTED.`,
        "invalid_task_status",
      );
      return;
    }
    if (
      !can(actor, {
        action: "task.accept",
        resource: { departmentId: task.departmentId },
      })
    ) {
      denyWithAudit(
        req,
        res,
        "accept_task",
        task.id,
        "Actor cannot review this department.",
      );
      return;
    }
    task.status = "ACCEPTED";
    recordAudit(req, "accept_task", task.id, "SUCCESS");
    res.json({ data: task });
  });

  router.post("/tasks/:id/return", validate(returnSchema), (req, res) => {
    const actor = req.actor!;
    const task = req.state!.tasks.find(
      (candidate) => candidate.id === req.params.id,
    );
    if (!task) {
      taskNotFound(req, res);
      return;
    }
    if (isPeriodLocked(req, task.periodId)) {
      problem(
        req,
        res,
        409,
        "Conflict",
        "Cannot return task in a locked period.",
        "period_locked",
      );
      return;
    }
    if (task.status !== "SUBMITTED") {
      problem(
        req,
        res,
        409,
        "Conflict",
        `Cannot return task with status ${task.status}. Task must be SUBMITTED.`,
        "invalid_task_status",
      );
      return;
    }
    if (
      !can(actor, {
        action: "task.return",
        resource: { departmentId: task.departmentId },
      })
    ) {
      denyWithAudit(
        req,
        res,
        "return_task",
        task.id,
        "Actor cannot review this department.",
      );
      return;
    }
    const input = req.validated as z.infer<typeof returnSchema>;
    task.status = "RETURNED";
    recordAudit(req, "return_task", task.id, "SUCCESS", input.note);
    res.json({ data: task });
  });

  return router;
}
