import type { AuditEvent, DemoUser, Evaluation, Task } from "./types";

// Candidate UI policy for synthetic demo only. The API must enforce real grants.
export const canManage = (u: DemoUser | null) => u?.role === "lanh_dao";
export const canAssign = (u: DemoUser | null) => !!u && u.role !== "cong_chuc";
export const canViewDepartment = (u: DemoUser | null, id: string) =>
  !!u && (canManage(u) || u.departmentId === id);
export const canViewTask = (u: DemoUser | null, t: Task) =>
  !!u &&
  (canManage(u) ||
    (u.role === "truong_phong"
      ? u.departmentId === t.departmentId
      : u.id === t.assigneeId));
export const canSubmitResult = (u: DemoUser | null, id: string) =>
  !!u && u.id === id;
export const canReviewTask = (u: DemoUser | null, id: string) =>
  canAssign(u) && canViewDepartment(u, id);
export const canViewEvaluation = (u: DemoUser | null, e: Evaluation) =>
  !!u &&
  (canManage(u) ||
    (u.role === "truong_phong"
      ? u.departmentId === e.departmentId
      : e.subjectType === "PERSON" && u.id === e.subjectId));
export const canReviewEvaluation = canReviewTask;
export const canDecide = canManage;
export const canLock = canManage;
export const canViewAudit = canAssign;
export function canViewAuditEvent(
  u: DemoUser | null,
  e: AuditEvent,
  taskDept?: string,
  evalDept?: string,
): boolean {
  if (!canViewAudit(u)) return false;
  if (canManage(u) || e.actorId === u?.id) return true;
  return (
    !!u?.departmentId &&
    (taskDept === u.departmentId || evalDept === u.departmentId)
  );
}
export const policy = {
  canManage,
  canAssign,
  canViewDepartment,
  canViewTask,
  canSubmitResult,
  canReviewTask,
  canViewEvaluation,
  canReviewEvaluation,
  canDecide,
  canLock,
  canViewAudit,
};
