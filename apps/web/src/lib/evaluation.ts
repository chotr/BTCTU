import {
  appendAudit,
  getState,
  pushToast,
  setState,
  upsertEvaluation,
} from "@/lib/store";
import {
  canDecide,
  canLock,
  canManage,
  canReviewEvaluation,
  canViewDepartment,
  canViewEvaluation,
} from "@/lib/policy";
import {
  calculateCandidate,
  classificationEligibility,
  evaluationTasks,
  taskInPeriod,
} from "@/lib/evaluation-engine";
import { initialConditions } from "@/lib/domain/conditions";
import type {
  CalculationRun,
  Classification,
  ConditionCheck,
  Evaluation,
  EvaluationPeriod,
} from "@/lib/types";
import { uid, now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { personName, departmentName } from "@/lib/shared/names";
import { EVAL_EDITABLE, EVAL_IN_REVIEW } from "@/lib/domain/workflow";
function record(ev: Evaluation, action: string, note: string): Evaluation {
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
function editable(
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

function calculationProblem(ev: Evaluation): string | null {
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

export const evaluationActions = {
  async createEvaluation(input: {
    periodId: string;
    subjectType: "PERSON" | "DEPARTMENT";
    subjectId: string;
    isLeader?: boolean;
  }): Promise<string | null> {
    const state = getState(),
      user = state.user;
    const period = state.periods.find((row) => row.id === input.periodId);
    const person = state.people.find((row) => row.id === input.subjectId);
    const departmentId =
      input.subjectType === "DEPARTMENT"
        ? input.subjectId
        : person?.departmentId;
    if (
      !user ||
      !departmentId ||
      !canViewDepartment(user, departmentId) ||
      (user.role === "cong_chuc" &&
        (input.subjectType !== "PERSON" || input.subjectId !== user.id))
    ) {
      deny(
        "Tạo đánh giá",
        input.subjectId,
        "Bạn không có quyền tạo hồ sơ cho đối tượng này.",
      );
      return null;
    }
    if (!period || period.status !== "ACTIVE") {
      deny("Tạo đánh giá", input.periodId, "Chọn một kỳ đang mở.");
      return null;
    }
    const existing = state.evaluations.find(
      (row) =>
        row.periodId === input.periodId &&
        row.subjectType === input.subjectType &&
        row.subjectId === input.subjectId,
    );
    if (existing) {
      pushToast("info", "Đối tượng đã có hồ sơ trong kỳ; mở hồ sơ hiện có.");
      return existing.id;
    }
    const id = uid("EV").toUpperCase();
    const isLeader =
      input.subjectType === "DEPARTMENT" ||
      (input.isLeader ?? /head|deputy|chief/.test(person?.positionRefId ?? ""));
    const ev: Evaluation = {
      id,
      ...input,
      departmentId,
      isLeader,
      status: "DRAFT",
      generalScore: 0,
      generalMax: 30,
      axes: [],
      calc: {
        ruleVersion: "Chưa tính · CANDIDATE",
        formulaText: isLeader
          ? "Điểm chung + (A+B+C+D)/4 × 70%"
          : "Điểm chung + (A+B+C)/3 × 70%",
        kpiText: "Chưa tính",
        averageAxes: 0,
        textTotal: 0,
        arithmeticTotal: null,
        note: null,
        status: "CANDIDATE",
      },
      self: null,
      review: null,
      decision: null,
      conditions: initialConditions(),
      history: [],
      calculationRuns: [],
      decisionHistory: [],
      reviewHistory: [],
      quotaApplicability: "UNKNOWN",
    };
    upsertEvaluation(
      record(ev, "Tạo hồ sơ đánh giá", "Dữ liệu giả · mô hình ứng viên"),
    );
    pushToast("success", "Đã tạo hồ sơ đánh giá");
    return id;
  },

  async calculateEvaluation(
    id: string,
    input: {
      generalScore: number;
      leadershipScore?: number;
      reason?: string;
      overrideTotal?: number;
    },
  ): Promise<boolean> {
    const ev = editable(id, "Tính KPI", EVAL_EDITABLE);
    if (!ev) return false;
    const state = getState(),
      user = state.user!;
    if (!canCalculateEvaluation(user, ev))
      return deny("Tính KPI", id, "Bạn không có quyền tính KPI cho hồ sơ này.");
    if (
      ev.status === "SUBMITTED" &&
      (!canReviewEvaluation(user, ev.departmentId) || canSelfEvaluate(user, ev))
    )
      return deny(
        "Tính KPI",
        id,
        "Đã nộp hồ sơ; chỉ người thẩm định độc lập được tính lại ở bước này.",
      );
    if (ev.isLeader && input.leadershipScore === undefined)
      return deny(
        "Tính KPI",
        id,
        "Chưa có điểm D về điều hành; không được mặc định điểm thiếu thành 0.",
      );
    if (
      input.overrideTotal !== undefined &&
      (!canDecide(user) ||
        !input.reason?.trim() ||
        !Number.isFinite(input.overrideTotal) ||
        input.overrideTotal < 0 ||
        input.overrideTotal > 100)
    )
      return deny(
        "Điều chỉnh điểm",
        id,
        "Điều chỉnh điểm yêu cầu lãnh đạo, lý do và giá trị từ 0 đến 100.",
      );
    const period = state.periods.find((row) => row.id === ev.periodId)!;
    let calculated: ReturnType<typeof calculateCandidate>;
    try {
      calculated = calculateCandidate(
        evaluationTasks(state.tasks, ev, period),
        input.generalScore,
        ev.isLeader ? (input.leadershipScore ?? 0) : undefined,
      );
    } catch (error) {
      return deny(
        "Tính KPI",
        id,
        error instanceof Error ? error.message : "Dữ liệu tính không hợp lệ.",
      );
    }
    const run: CalculationRun = {
      ...calculated,
      id: uid("RUN"),
      at: now(),
      actorId: user.id,
      reason: input.reason?.trim() ?? "Tính từ kết quả nhiệm vụ đã nghiệm thu",
      finalTotal: input.overrideTotal ?? calculated.calculatedTotal,
      ...(input.overrideTotal !== undefined
        ? {
            override: {
              value: input.overrideTotal,
              reason: input.reason!.trim(),
              actorId: user.id,
            },
          }
        : {}),
    };
    const average =
      run.axes.reduce((sum, axis) => sum + axis.value, 0) / run.axes.length;
    upsertEvaluation(
      record(
        {
          ...ev,
          generalScore: input.generalScore,
          axes: run.axes,
          calculationRuns: [...(ev.calculationRuns ?? []), run],
          calc: {
            ruleVersion: run.ruleVersion,
            formulaText: ev.isLeader
              ? "Tổng = Điểm chung + (A+B+C+D)/4 × 70%"
              : "Tổng = Điểm chung + (A+B+C)/3 × 70%",
            kpiText: `${average.toFixed(2)}%`,
            averageAxes: average,
            textTotal: run.finalTotal,
            arithmeticTotal: run.finalTotal,
            status: "CANDIDATE",
            note: ev.isLeader
              ? "INC-01: ví dụ nguồn ghi 80,3; số học 30 + 82,3% × 70 = 87,61. Quy tắc này là ứng viên, chưa được kích hoạt chính thức."
              : "INC-02: công thức ABC là lựa chọn thiết kế ứng viên; không phải công thức nhân viên đã xác nhận từ 05-HD/TU.",
          },
        },
        input.overrideTotal !== undefined
          ? "Điều chỉnh điểm có lý do"
          : "Tính KPI · snapshot mới",
        run.reason,
      ),
    );
    pushToast(
      "success",
      "Đã lưu lần tính mới; các snapshot trước được giữ nguyên",
    );
    return true;
  },

  async updateConditions(
    id: string,
    conditions: ConditionCheck[],
    reason: string,
    quotaApplicability?: Evaluation["quotaApplicability"],
    quotaConfirmed?: boolean,
  ): Promise<boolean> {
    const ev = editable(id, "Xác nhận điều kiện", EVAL_EDITABLE);
    if (!ev) return false;
    if (!canCalculateEvaluation(getState().user, ev) || !reason.trim())
      return deny(
        "Xác nhận điều kiện",
        id,
        "Cần đúng phạm vi quyền và lý do/căn cứ xác nhận.",
      );
    if (
      ev.status === "SUBMITTED" &&
      (!canReviewEvaluation(getState().user, ev.departmentId) ||
        canSelfEvaluate(getState().user, ev))
    )
      return deny(
        "Xác nhận điều kiện",
        id,
        "Hồ sơ đã nộp; chỉ người thẩm định độc lập được xác nhận lại.",
      );
    if (
      conditions.length !== ev.conditions.length ||
      new Set(conditions.map((c) => c.id)).size !== conditions.length ||
      conditions.some(
        (row) =>
          typeof row.passed !== "boolean" ||
          !ev.conditions.some(
            (original) =>
              original.id === row.id && original.blocking === row.blocking,
          ),
      )
    )
      return deny(
        "Xác nhận điều kiện",
        id,
        "Không được xóa hoặc thay đổi cấu trúc điều kiện bắt buộc.",
      );
    const next = ev.conditions.map((original) => ({
      ...original,
      passed: conditions.find((row) => row.id === original.id)!.passed,
    }));
    upsertEvaluation(
      record(
        {
          ...ev,
          conditions: next,
          conditionReason: reason.trim(),
          quotaApplicability: quotaApplicability ?? ev.quotaApplicability,
          quotaConfirmed: quotaConfirmed ?? ev.quotaConfirmed,
        },
        "Xác nhận điều kiện ứng viên",
        reason.trim(),
      ),
    );
    pushToast("success", "Đã lưu xác nhận điều kiện và căn cứ");
    return true;
  },

  async selfEvaluate(
    id: string,
    input: { comment: string; proposed: Classification },
  ): Promise<boolean> {
    const ev = editable(id, "Nộp tự đánh giá", ["DRAFT"]);
    if (!ev) return false;
    if (!canSelfEvaluate(getState().user, ev))
      return deny(
        "Nộp tự đánh giá",
        id,
        "Chỉ cá nhân được đánh giá hoặc trưởng phòng đại diện tập thể được nộp.",
      );
    const run = ev.calculationRuns?.at(-1);
    const problem = calculationProblem(ev);
    if (problem) return deny("Nộp tự đánh giá", id, problem);
    if (!input.comment.trim() || !run || run.missingInputs.length)
      return deny(
        "Nộp tự đánh giá",
        id,
        "Cần nhận xét và một lần tính KPI đủ dữ liệu. Hãy nghiệm thu kết quả rồi tính lại.",
      );
    upsertEvaluation(
      record(
        {
          ...ev,
          status: "SUBMITTED",
          self: { ...input, comment: input.comment.trim(), at: now() },
          review: null,
        },
        "Nộp tự đánh giá",
        input.comment.trim(),
      ),
    );
    pushToast("success", "Đã nộp hồ sơ cho người thẩm định");
    return true;
  },

  async reviewEvaluation(
    id: string,
    input: {
      comment: string;
      proposed: Classification;
      action: "propose" | "return";
    },
  ): Promise<boolean> {
    const ev = editable(id, "Thẩm định đánh giá", EVAL_IN_REVIEW);
    if (!ev) return false;
    const user = getState().user!;
    if (
      !canReviewEvaluation(user, ev.departmentId) ||
      (ev.subjectType === "PERSON" && ev.subjectId === user.id) ||
      (ev.subjectType === "DEPARTMENT" && user.role !== "lanh_dao")
    )
      return deny(
        "Thẩm định đánh giá",
        id,
        "Không được tự thẩm định hồ sơ cá nhân/tập thể của mình.",
      );
    if (!input.comment.trim())
      return deny(
        "Thẩm định đánh giá",
        id,
        "Nhập nhận xét hoặc lý do trả lại.",
      );
    const problem = input.action === "propose" ? calculationProblem(ev) : null;
    if (problem) return deny("Thẩm định đánh giá", id, problem);
    if (
      ev.status === "REVIEWED" &&
      (input.action !== "return" || !canDecide(user))
    )
      return deny(
        "Thẩm định đánh giá",
        id,
        "Hồ sơ đã thẩm định chỉ cấp quyết định được trả về bước trước.",
      );
    const nextStatus =
      input.action === "propose"
        ? "REVIEWED"
        : ev.status === "REVIEWED"
          ? "SUBMITTED"
          : "DRAFT";
    const review =
      input.action === "propose"
        ? {
            comment: input.comment.trim(),
            proposed: input.proposed,
            reviewerId: user.id,
            at: now(),
          }
        : null;
    upsertEvaluation(
      record(
        {
          ...ev,
          status: nextStatus,
          review,
          reviewHistory: ev.review
            ? [...(ev.reviewHistory ?? []), ev.review]
            : ev.reviewHistory,
        },
        input.action === "propose" ? "Thẩm định, đề xuất" : "Trả lại hồ sơ",
        input.comment.trim(),
      ),
    );
    pushToast(
      "success",
      input.action === "propose"
        ? "Đã trình cấp quyết định"
        : "Đã trả lại hồ sơ và lưu lý do",
    );
    return true;
  },

  async decideEvaluation(
    id: string,
    input: { classification: Classification; note: string },
  ): Promise<boolean> {
    const ev = editable(id, "Quyết định xếp loại", ["REVIEWED"]);
    if (!ev) return false;
    const user = getState().user!;
    if (!canDecide(user) || ev.subjectId === user.id)
      return deny(
        "Quyết định xếp loại",
        id,
        "Không đủ thẩm quyền hoặc đang tự quyết định hồ sơ cá nhân.",
      );
    if (!input.note.trim())
      return deny("Quyết định xếp loại", id, "Nhập căn cứ quyết định.");
    const problem = calculationProblem(ev);
    if (problem) return deny("Quyết định xếp loại", id, problem);
    const problems = classificationEligibility(
      evaluationTotal(ev),
      ev.conditions,
      input.classification,
      ev.quotaApplicability,
      ev.quotaConfirmed,
    );
    if (problems.length)
      return deny("Quyết định xếp loại", id, problems.join(" "));
    const decision = {
      classification: input.classification,
      decidedById: user.id,
      at: now(),
      note: input.note.trim(),
      calculationRunId: ev.calculationRuns?.at(-1)?.id,
    };
    upsertEvaluation(
      record(
        {
          ...ev,
          status: "APPROVED",
          decision,
          decisionHistory: ev.decision
            ? [...(ev.decisionHistory ?? []), ev.decision]
            : ev.decisionHistory,
        },
        "Quyết định xếp loại ứng viên",
        input.note.trim(),
      ),
    );
    pushToast("success", "Đã lưu quyết định xếp loại và căn cứ");
    return true;
  },

  async lockPeriod(id: string): Promise<boolean> {
    const state = getState(),
      user = state.user;
    const period = state.periods.find((row) => row.id === id),
      evaluations = state.evaluations.filter((row) => row.periodId === id);
    if (!user || !canLock(user))
      return deny("Khóa kỳ", id, "Chỉ lãnh đạo demo có quyền khóa kỳ.");
    if (!period || period.status !== "ACTIVE")
      return deny("Khóa kỳ", id, "Kỳ không tồn tại hoặc đã khóa.");
    if (
      !evaluations.length ||
      evaluations.some((ev) => ev.status !== "APPROVED")
    )
      return deny(
        "Khóa kỳ",
        id,
        "Chỉ khóa khi có hồ sơ và mọi hồ sơ trong kỳ đã có quyết định.",
      );
    const at = now();
    setState((current) => ({
      ...current,
      periods: current.periods.map((row) =>
        row.id === id ? { ...row, status: "LOCKED", lockedAt: at } : row,
      ),
      evaluations: current.evaluations.map((ev) =>
        ev.periodId === id
          ? {
              ...ev,
              status: "LOCKED",
              history: [
                ...ev.history,
                {
                  id: uid("h"),
                  at,
                  actorId: user.id,
                  action: "Khóa kỳ",
                  note: "Bảo toàn quyết định và snapshot. Các nhiệm vụ trong kỳ không được sửa.",
                },
              ],
            }
          : ev,
      ),
    }));
    appendAudit({
      actorId: user.id,
      action: "Khóa kỳ",
      resource: id,
      detail: `${evaluations.length} hồ sơ; toàn bộ dữ liệu nhiệm vụ trong kỳ chỉ đọc`,
      outcome: "OK",
    });
    pushToast("success", "Đã khóa kỳ; nhiệm vụ và hồ sơ trong kỳ chỉ được xem");
    return true;
  },

  async reopenPeriod(id: string, reason: string): Promise<boolean> {
    const state = getState(),
      user = state.user;
    const period = state.periods.find((row) => row.id === id);
    if (!user || !canLock(user) || !reason.trim())
      return deny(
        "Mở lại kỳ",
        id,
        "Mở lại kỳ yêu cầu lãnh đạo và lý do cụ thể.",
      );
    if (!period || period.status !== "LOCKED")
      return deny("Mở lại kỳ", id, "Chỉ mở lại kỳ đang khóa.");
    const at = now();
    setState((current) => ({
      ...current,
      periods: current.periods.map((row) =>
        row.id === id
          ? {
              ...row,
              status: "ACTIVE",
              lockedAt: null,
              reopenedAt: at,
              reopenReason: reason.trim(),
            }
          : row,
      ),
      evaluations: current.evaluations.map((ev) =>
        ev.periodId === id
          ? {
              ...ev,
              status: "DRAFT",
              decisionHistory: ev.decision
                ? [...(ev.decisionHistory ?? []), ev.decision]
                : ev.decisionHistory,
              reviewHistory: ev.review
                ? [...(ev.reviewHistory ?? []), ev.review]
                : ev.reviewHistory,
              decision: null,
              review: null,
              self: null,
              revision: (ev.revision ?? 0) + 1,
              history: [
                ...ev.history,
                {
                  id: uid("h"),
                  at,
                  actorId: user.id,
                  action: "Mở lại kỳ · tạo phiên bản nháp",
                  note: reason.trim(),
                },
              ],
            }
          : ev,
      ),
      tasks: current.tasks.map((task) =>
        taskInPeriod(task, period) && task.status === "LOCKED"
          ? { ...task, status: "ACCEPTED" }
          : task,
      ),
    }));
    appendAudit({
      actorId: user.id,
      action: "Mở lại kỳ",
      resource: id,
      detail: reason.trim() + " · giữ nguyên các quyết định và lần tính trước",
      outcome: "OK",
    });
    pushToast(
      "success",
      "Đã mở lại kỳ; hồ sơ trở về nháp, giữ toàn bộ lịch sử",
    );
    return true;
  },

  async createPeriod(input: {
    name: string;
    kind: NonNullable<EvaluationPeriod["kind"]>;
    startDate: string;
    endDate: string;
  }): Promise<boolean> {
    const state = getState(),
      user = state.user;
    if (!user || !canManage(user))
      return deny("Tạo kỳ", input.name, "Bạn không có quyền tạo kỳ đánh giá.");
    if (
      !input.name.trim() ||
      !Number.isFinite(Date.parse(input.startDate)) ||
      !Number.isFinite(Date.parse(input.endDate)) ||
      input.startDate > input.endDate ||
      state.periods.some(
        (row) =>
          row.name.toLocaleLowerCase() ===
          input.name.trim().toLocaleLowerCase(),
      )
    )
      return deny(
        "Tạo kỳ",
        input.name,
        "Tên kỳ phải duy nhất và khoảng ngày hợp lệ.",
      );
    const period: EvaluationPeriod = {
      id: uid("PERIOD"),
      ...input,
      name: input.name.trim(),
      range: `${input.startDate.split("-").reverse().join("/")} – ${input.endDate.split("-").reverse().join("/")}`,
      status: "ACTIVE",
      lockedAt: null,
    };
    setState((current) => ({
      ...current,
      periods: [period, ...current.periods],
    }));
    appendAudit({
      actorId: user.id,
      action: "Tạo kỳ đánh giá",
      resource: period.id,
      detail:
        period.name + " · thiết kế ứng viên, không tự tổng hợp tháng/quý/năm",
      outcome: "OK",
    });
    pushToast("success", "Đã tạo kỳ đánh giá");
    return true;
  },
};
