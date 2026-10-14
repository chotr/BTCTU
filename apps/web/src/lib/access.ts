import type { AppState } from "./store";
import {
  canViewAuditEvent,
  canViewDepartment,
  canViewEvaluation,
  canViewTask,
} from "./policy";
import { ROLES } from "@/lib/types";

/** Records the signed-in role is allowed to see. Export and screens share this. */
export function scopedData(s: AppState) {
  return {
    tasks: s.tasks.filter((t) => canViewTask(s.user, t)),
    evaluations: s.evaluations.filter((e) => canViewEvaluation(s.user, e)),
    departments: s.departments.filter((d) => canViewDepartment(s.user, d.id)),
    people: s.people.filter((p) =>
      s.user?.role === ROLES.congChuc
        ? p.id === s.user.id
        : canViewDepartment(s.user, p.departmentId),
    ),
    audit: s.audit.filter((a) =>
      canViewAuditEvent(
        s.user,
        a,
        s.tasks.find((t) => t.id === a.resource)?.departmentId,
        s.evaluations.find((e) => e.id === a.resource)?.departmentId,
      ),
    ),
  };
}
