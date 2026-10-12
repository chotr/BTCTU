import { getState, pushToast, upsertEvaluation } from "@/lib/store";
import { canDecide, canReviewEvaluation } from "@/lib/policy";
import { classificationEligibility } from "@/lib/evaluation-engine";
import { now } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { EVAL_IN_REVIEW } from "@/lib/domain/workflow";
import type { Classification } from "@/lib/types";
import {
  calculationProblem,
  canSelfEvaluate,
  editable,
  evaluationTotal,
  record,
} from "./shared";

export const workflowActions = {
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
        "Quyết định xếp loại",
        input.note.trim(),
      ),
    );
    pushToast("success", "Đã lưu quyết định xếp loại và căn cứ");
    return true;
  },
};
