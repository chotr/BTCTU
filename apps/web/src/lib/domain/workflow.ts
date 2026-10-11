import type { EvalStatus, TaskStatus } from "@/lib/types";

/**
 * Single source of truth for lifecycle status groups. Adding a status should
 * only require editing these tables, not scattered `if/switch` checks (OCP).
 */

/** Task states that a member/reviewer may still edit. */
export const TASK_EDITABLE = [
  "ASSIGNED",
  "IN_PROGRESS",
  "RETURNED",
] as const satisfies readonly TaskStatus[];

/** Task states awaiting an independent reviewer. */
export const TASK_IN_REVIEW = [
  "SUBMITTED",
  "REVIEWED",
] as const satisfies readonly TaskStatus[];

/** Task states that are accepted/final. */
export const TASK_DONE = ["ACCEPTED", "LOCKED"] as const satisfies readonly TaskStatus[];

/** Evaluation states that may still be calculated/confirmed. */
export const EVAL_EDITABLE = [
  "DRAFT",
  "SUBMITTED",
] as const satisfies readonly EvalStatus[];

/** Evaluation states awaiting review/appraisal. */
export const EVAL_IN_REVIEW = [
  "SUBMITTED",
  "REVIEWED",
] as const satisfies readonly EvalStatus[];

/** Evaluation states that are decided/final (read-only). */
export const EVAL_FINAL = ["APPROVED", "LOCKED"] as const satisfies readonly EvalStatus[];

export const inGroup = (group: readonly string[], value: string): boolean =>
  group.includes(value);
