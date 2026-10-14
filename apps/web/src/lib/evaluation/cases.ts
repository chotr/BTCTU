import { getState, pushToast, upsertEvaluation } from "@/lib/store";
import { canViewDepartment } from "@/lib/policy";
import { initialConditions } from "@/lib/domain/conditions";
import { uid } from "@/lib/shared/ids";
import { deny } from "@/lib/shared/feedback";
import { ROLES, type Evaluation } from "@/lib/types";
import { record } from "./shared";

export const caseActions = {
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
      (user.role === ROLES.congChuc &&
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
      record(ev, "Tạo hồ sơ đánh giá", "Khởi tạo theo cấu hình hiện hành"),
    );
    pushToast("success", "Đã tạo hồ sơ đánh giá");
    return id;
  },
};
