import { appendAudit, getState } from "@/lib/store";
import { canReviewEvaluation, canViewEvaluation } from "@/lib/policy";
import { calculateCandidate, evaluationTasks } from "@/lib/evaluation-engine";
import { uid, now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { personName, departmentName } from "@/lib/shared/names";
import type { Evaluation } from "@/lib/types";

/** Thêm một mục lịch sử và bản ghi audit; tăng số phiên bản bản ghi. */
export function record(
  ev: Evaluation,
  action: string,
  note: string,
): Evaluation {
  const actorId = getState().user!.id;
  appendAudit({
    actorId,
    action,
    resource: ev.id,
    detail: note,
    outcome: "OK",
  });
  return {
    ...ev,
    revision: (ev.revision ?? 0) + 1,
    history: [
      ...ev.history,
      { id: uid("h"), at: now(), actorId, action, note },
    ],
  };
}

/** Kiểm tra từ chối-kèm-trả về: hồ sơ tồn tại, trong phạm vi và ở trạng thái chỉnh sửa được. */
export function editable(
  id: string,
  action: string,
  statuses: readonly Evaluation["status"][],
): Evaluation | null {
  const state = getState();
  const ev = state.evaluations.find((row) => row.id === id);
  if (!ev || !canViewEvaluation(state.user, ev)) {
    deny(action, id, "Hồ sơ không tồn tại hoặc nằm ngoài phạm vi của bạn.");
    return null;
  }
  if (
    state.periods.find((period) => period.id === ev.periodId)?.status !==
      "ACTIVE" ||
    !statuses.includes(ev.status)
  ) {
    deny(
      action,
      id,
      "Trạng thái hồ sơ/kỳ không cho phép thao tác. Hãy mở lại kỳ theo đúng quy trình.",
    );
    return null;
  }
  return ev;
}

export function canSelfEvaluate(
  user: ReturnType<typeof getState>["user"],
  ev: Evaluation,
): boolean {
  return (
    !!user &&
    (ev.subjectType === "PERSON"
      ? user.id === ev.subjectId
      : user.role === "truong_phong" && user.departmentId === ev.departmentId)
  );
}

export function canCalculateEvaluation(
  user: ReturnType<typeof getState>["user"],
  ev: Evaluation,
): boolean {
  return (
    canSelfEvaluate(user, ev) || canReviewEvaluation(user, ev.departmentId)
  );
}

export function evaluationLabel(ev: Evaluation, state = getState()): string {
  return (
    (ev.subjectType === "DEPARTMENT"
      ? departmentName(state, ev.subjectId)
      : personName(state, ev.subjectId)) ?? ev.subjectId
  );
}

export function evaluationTotal(ev: Evaluation): number {
  return (
    ev.calculationRuns?.at(-1)?.finalTotal ??
    ev.calc.arithmeticTotal ??
    ev.calc.textTotal
  );
}

export function calculationProblem(ev: Evaluation): string | null {
  const run = ev.calculationRuns?.at(-1);
  const s = getState();
  const period = s.periods.find((p) => p.id === ev.periodId);
  if (!run || !period || run.missingInputs.length)
    return "Cần một lần tính KPI đủ dữ liệu trước khi chuyển bước.";
  const current = calculateCandidate(
    evaluationTasks(s.tasks, ev, period),
    run.generalScore,
    ev.isLeader ? run.axes.find((a) => a.code === "D")?.value : undefined,
  );
  if (
    JSON.stringify(current.taskSnapshots) !== JSON.stringify(run.taskSnapshots)
  )
    return "Đầu vào nhiệm vụ đã thay đổi sau lần tính. Hãy tính lại KPI trước khi chuyển bước.";
  return null;
}
