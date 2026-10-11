export type Role = "lanh_dao" | "truong_phong" | "cong_chuc";

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
  title: string;
  departmentId: string | null;
  departmentName: string | null;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  shortName: string;
  functionText: string;
  headId: string;
  responsibilityIds: string[];
}

export interface PositionRef {
  id: string;
  title: string;
  scope: string;
}

export interface Person {
  id: string;
  name: string;
  title: string;
  departmentId: string;
  positionRefId: string;
}

export interface ResponsibilityRef {
  id: string;
  departmentId: string;
  name: string;
  sourceRef: string;
}

export type CatalogStatus = "DRAFT" | "PUBLISHED";

export interface CatalogItem {
  id: string;
  version: string;
  code: string;
  name: string;
  product: string;
  unit: string;
  complexity: "Cao" | "Trung bình" | "Thấp";
  standardScore: number;
  coefficient: number;
  durationDays: number;
  sourceRef: string;
  status: CatalogStatus;
}

export type TaskStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "RETURNED"
  | "REVIEWED"
  | "ACCEPTED"
  | "LOCKED"
  | "CANCELLED";

export interface EvidenceRef {
  id: string;
  name: string;
  kind: string;
  size: string;
  classification: "Nội bộ" | "Hạn chế";
  uploadedAt: string;
  sizeBytes?: number;
  uploadedBy?: string;
  synthetic?: boolean;
  storageMode?: "METADATA_ONLY";
}

export interface HistoryEntry {
  id: string;
  at: string;
  actorId: string;
  action: string;
  note: string;
}

export interface TaskResult {
  quantity: number;
  unit: string;
  product: string;
  qualityLevel: string;
  note: string;
  submittedAt: string;
  completedAt?: string;
}

export interface Task {
  plannedQuantity?: number;
  id: string;
  title: string;
  description: string;
  catalogItemId: string;
  departmentId: string;
  assigneeId: string;
  assignerId: string;
  positionRefId: string;
  period: string;
  periodId?: string;
  catalogSnapshot?: Pick<
    CatalogItem,
    | "id"
    | "version"
    | "code"
    | "name"
    | "product"
    | "unit"
    | "standardScore"
    | "coefficient"
    | "durationDays"
    | "sourceRef"
  >;
  assignmentSnapshot?: {
    assigneeName: string;
    positionTitle: string;
    departmentName: string;
    assignedAt: string;
  };
  revision?: number;
  dueAt: string;
  status: TaskStatus;
  progress: number;
  result: TaskResult | null;
  evidence: EvidenceRef[];
  history: HistoryEntry[];
}

export type Classification =
  "XUAT_SAC" | "TOT" | "HOAN_THANH" | "KHONG_HOAN_THANH";

export const CLASS_LABELS: Record<Classification, string> = {
  XUAT_SAC: "Hoàn thành xuất sắc nhiệm vụ",
  TOT: "Hoàn thành tốt nhiệm vụ",
  HOAN_THANH: "Hoàn thành nhiệm vụ",
  KHONG_HOAN_THANH: "Không hoàn thành nhiệm vụ",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  ASSIGNED: "Đã giao",
  IN_PROGRESS: "Đang thực hiện",
  SUBMITTED: "Chờ nghiệm thu",
  RETURNED: "Yêu cầu chỉnh sửa",
  REVIEWED: "Đã thẩm định",
  ACCEPTED: "Đã nghiệm thu",
  LOCKED: "Đã khóa kỳ",
  CANCELLED: "Đã hủy",
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

export interface AuditEvent {
  id: string;
  at: string;
  actorId: string;
  action: string;
  resource: string;
  detail: string;
  outcome: "OK" | "DENIED";
  requestId: string;
}

export interface ToastMsg {
  id: number;
  kind: "info" | "success" | "error";
  text: string;
}
