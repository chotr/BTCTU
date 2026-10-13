import type { HistoryEntry } from "./task";

export type Classification =
  "XUAT_SAC" | "TOT" | "HOAN_THANH" | "KHONG_HOAN_THANH";

export const CLASS_LABELS: Record<Classification, string> = {
  XUAT_SAC: "Hoàn thành xuất sắc nhiệm vụ",
  TOT: "Hoàn thành tốt nhiệm vụ",
  HOAN_THANH: "Hoàn thành nhiệm vụ",
  KHONG_HOAN_THANH: "Không hoàn thành nhiệm vụ",
};

export interface AxisSnapshot {
  code: "A" | "B" | "C" | "D";
  label: string;
  value: number;
  detail: string;
}

export interface ConditionCheck {
  id: string;
  label: string;
  detail: string;
  passed: boolean;
  blocking: boolean;
}

export interface CalcSnapshot {
  ruleVersion: string;
  formulaText: string;
  kpiText: string;
  averageAxes: number;
  textTotal: number;
  arithmeticTotal: number | null;
  note: string | null;
  status?: "CANDIDATE";
}

export interface CalculationRun {
  id: string;
  at: string;
  actorId: string;
  ruleVersion: string;
  generalScore: number;
  axes: AxisSnapshot[];
  calculatedTotal: number;
  finalTotal: number;
  taskSnapshots: {
    id: string;
    title: string;
    status: string;
    quantity: number;
    plannedQuantity: number;
    quality: string;
    submittedAt: string;
    dueAt: string;
    catalogVersion: string;
  }[];
  missingInputs: string[];
  override?: { value: number; reason: string; actorId: string };
  reason: string;
}

export type EvalStatus =
  "DRAFT" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "LOCKED";

export const EVAL_STATUS_LABELS: Record<EvalStatus, string> = {
  DRAFT: "Bản nháp",
  SUBMITTED: "Đã tự đánh giá",
  REVIEWED: "Đã thẩm định, đề xuất",
  APPROVED: "Đã quyết định",
  LOCKED: "Đã khóa kỳ",
};

export interface Evaluation {
  id: string;
  periodId: string;
  subjectId: string;
  subjectType: "PERSON" | "DEPARTMENT";
  departmentId: string;
  status: EvalStatus;
  isLeader: boolean;
  generalScore: number;
  generalMax: number;
  axes: AxisSnapshot[];
  calc: CalcSnapshot;
  self: { comment: string; proposed: Classification; at: string | null } | null;
  review: {
    comment: string;
    proposed: Classification;
    reviewerId: string;
    at: string;
  } | null;
  decision: {
    classification: Classification;
    decidedById: string;
    at: string;
    note?: string;
    calculationRunId?: string;
  } | null;
  conditions: ConditionCheck[];
  history: HistoryEntry[];
  calculationRuns?: CalculationRun[];
  decisionHistory?: NonNullable<Evaluation["decision"]>[];
  reviewHistory?: NonNullable<Evaluation["review"]>[];
  quotaApplicability?: "UNKNOWN" | "NOT_APPLICABLE" | "APPLIES";
  quotaConfirmed?: boolean;
  conditionReason?: string;
  revision?: number;
}

export interface EvaluationPeriod {
  id: string;
  name: string;
  range: string;
  status: "ACTIVE" | "LOCKED";
  lockedAt: string | null;
  kind?: "MONTH" | "QUARTER" | "YEAR";
  startDate?: string;
  endDate?: string;
  reopenedAt?: string;
  reopenReason?: string;
}
