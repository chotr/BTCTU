import { appendAudit, getState, pushToast, type AppState } from "./store";
import {
  canViewAuditEvent,
  canViewDepartment,
  canViewEvaluation,
  canViewTask,
} from "./policy";
import { CLASS_LABELS, EVAL_STATUS_LABELS, TASK_STATUS_LABELS } from "./types";
import { csvCell, toCsv, downloadText } from "./shared/csv";
import { nameOf } from "./shared/names";

export { csvCell, toCsv, downloadText } from "./shared/csv";

export function scopedData(s: AppState) {
  return {
    tasks: s.tasks.filter((t) => canViewTask(s.user, t)),
    evaluations: s.evaluations.filter((e) => canViewEvaluation(s.user, e)),
    departments: s.departments.filter((d) => canViewDepartment(s.user, d.id)),
    people: s.people.filter((p) =>
      s.user?.role === "cong_chuc"
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
// Formula-neutralized CSV protects files opened with Excel.
export function exportReport(
  kind: "tasks" | "evaluations" | "audit",
  periodId = "ALL",
  departmentId = "ALL",
  subjectType = "ALL",
): void {
  const s = getState();
  if (!s.user) return;
  const scoped = scopedData(s);
  scoped.evaluations = scoped.evaluations.filter(
    (e) => subjectType === "ALL" || e.subjectType === subjectType,
  );
  const period = s.periods.find((p) => p.id === periodId);
  const name = (id: string) => nameOf(s, id) ?? id;
  let rows: unknown[][];
  if (kind === "audit")
    rows = [
      [
        "Thời gian",
        "Người thực hiện",
        "Hành động",
        "Đối tượng",
        "Chi tiết",
        "Kết quả",
        "Request ID",
      ],
      ...scoped.audit.map((a) => [
        a.at,
        name(a.actorId),
        a.action,
        a.resource,
        a.detail,
        a.outcome,
        a.requestId,
      ]),
    ];
  else if (kind === "tasks")
    rows = [
      [
        "Mã",
        "Nhiệm vụ",
        "Người thực hiện",
        "Phòng",
        "Kỳ",
        "Hạn",
        "Trạng thái",
        "Tiến độ",
        "Sản phẩm",
      ],
      ...scoped.tasks
        .filter(
          (t) =>
            (periodId === "ALL" ||
              t.periodId === periodId ||
              t.period === period?.name) &&
            (departmentId === "ALL" || t.departmentId === departmentId),
        )
        .map((t) => [
          t.id,
          t.title,
          name(t.assigneeId),
          name(t.departmentId),
          t.period,
          t.dueAt,
          TASK_STATUS_LABELS[t.status],
          t.progress,
          t.result?.product,
        ]),
    ];
  else
    rows = [
      [
        "Mã",
        "Đối tượng",
        "Loại",
        "Kỳ",
        "Trạng thái",
        "Điểm tính",
        "Tự đề xuất",
        "Thẩm định",
        "Quyết định",
        "Phiên bản quy tắc",
      ],
      ...scoped.evaluations
        .filter(
          (e) =>
            (periodId === "ALL" || e.periodId === periodId) &&
            (departmentId === "ALL" || e.departmentId === departmentId),
        )
        .map((e) => [
          e.id,
          name(e.subjectId),
          e.subjectType,
          s.periods.find((p) => p.id === e.periodId)?.name,
          EVAL_STATUS_LABELS[e.status],
          e.calc.arithmeticTotal ?? e.calc.textTotal,
          e.self ? CLASS_LABELS[e.self.proposed] : "",
          e.review ? CLASS_LABELS[e.review.proposed] : "",
          e.decision ? CLASS_LABELS[e.decision.classification] : "",
          e.calc.ruleVersion,
        ]),
    ];
  downloadText(
    `BTCTU-${kind}-${periodId}.csv`,
    toCsv([["BÁO CÁO DỰ THẢO — CẦN RÀ SOÁT TRƯỚC KHI BAN HÀNH"], ...rows]),
  );
  appendAudit({
    actorId: s.user.id,
    action: "Xuất báo cáo",
    resource: kind,
    detail: `CSV; kỳ ${periodId}; phạm vi ${departmentId}; ${rows.length - 1} dòng`,
    outcome: "OK",
  });
  pushToast("success", "Đã tải báo cáo CSV theo phạm vi truy cập");
}
