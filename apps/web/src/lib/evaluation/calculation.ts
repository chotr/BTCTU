import { getState, pushToast, upsertEvaluation } from "@/lib/store";
import { canDecide, canReviewEvaluation } from "@/lib/policy";
import { calculateScore } from "@/lib/domain/scoring";
import { evaluationTasks } from "@/lib/domain/periods";
import { uid, now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { EVAL_EDITABLE } from "@/lib/domain/workflow";
import type { CalculationRun, ConditionCheck, Evaluation } from "@/lib/types";
import {
  canCalculateEvaluation,
  canSelfEvaluate,
  editable,
  record,
} from "./shared";

export const calculationActions = {
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
    let calculated: ReturnType<typeof calculateScore>;
    try {
      calculated = calculateScore(
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
            status: "CALCULATED",
            note: ev.isLeader
              ? "Điểm tổng hợp theo khung 30/70 cán bộ lãnh đạo, quản lý."
              : "Điểm tổng hợp theo tiêu chí công chức, người lao động.",
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
        "Xác nhận điều kiện xếp loại",
        reason.trim(),
      ),
    );
    pushToast("success", "Đã lưu xác nhận điều kiện và căn cứ");
    return true;
  },
};
