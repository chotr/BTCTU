import type { AppUser, AuditEvent, Evaluation, Task } from "./types";

// UI policy improves usability; the API remains the authoritative enforcement point.
export const canManage = (u: AppUser | null) => u?.role === "lanh_dao";
export const canAssign = (u: AppUser | null) => !!u && u.role !== "cong_chuc";
export const canViewDepartment = (u: AppUser | null, id: string) =>
  !!u && (canManage(u) || u.departmentId === id);
export const canViewTask = (u: AppUser | null, t: Task) =>
  !!u &&
  (canManage(u) ||
    (u.role === "truong_phong"
      ? u.departmentId === t.departmentId
      : u.id === t.assigneeId));
export const canSubmitResult = (u: AppUser | null, id: string) =>
  !!u && u.id === id;
export const canReviewTask = (u: AppUser | null, id: string) =>
  canAssign(u) && canViewDepartment(u, id);
export const canViewEvaluation = (u: AppUser | null, e: Evaluation) =>
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
  u: AppUser | null,
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
