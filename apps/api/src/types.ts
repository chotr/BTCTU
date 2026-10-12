export type Role = "lanh_dao" | "truong_phong" | "cong_chuc";

export type Actor = {
  id: string;
  name: string;
  role: Role;
  departmentId: string | null;
};

export type Department = {
  id: string;
  code: string;
  name: string;
  shortName: string;
};

export type Person = {
  id: string;
  name: string;
  title: string;
  role: Role;
  departmentId: string;
  positionRefId: string;
};

export type CatalogItem = {
  id: string;
  version: string;
  title: string;
  departmentId: string;
  standardScore: number;
  coefficient: number;
  durationDays: number;
  sourceRef: string;
  sourceClass: "FACT" | "INFERENCE" | "TBD";
};

export type TaskStatus = "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED" | "RETURNED" | "ACCEPTED";

export type TaskResult = {
  quantity: number;
  product: string;
  qualityLevel: "A" | "B" | "C";
  note: string;
  submittedAt: string | null;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  catalogItemId: string;
  departmentId: string;
  assigneeId: string;
  assignerId: string;
  dueAt: string;
  status: TaskStatus;
  progress: number;
  result: TaskResult | null;
};

export type EvaluationStatus = "DRAFT" | "SUBMITTED" | "REVIEWED" | "APPROVED" | "LOCKED";
export type Classification = "XUAT_SAC" | "TOT" | "HOAN_THANH" | "KHONG_HOAN_THANH";

export type Evaluation = {
  id: string;
  periodId: string;
  subjectId: string;
  departmentId: string;
  status: EvaluationStatus;
  score: number;
  classification: Classification;
  blockerCount: number;
  selfComment: string | null;
  reviewComment: string | null;
  decisionNote: string | null;
};

export type AuditEvent = {
  id: string;
  requestId: string;
  actorId: string;
  action: string;
  resource: string;
  outcome: "OK" | "DENIED";
  detail: string;
  at: string;
};

export type Period = { id: string; label: string; lockedAt: string | null };

export type MockState = {
  departments: Department[];
  people: Person[];
  catalog: CatalogItem[];
  tasks: Task[];
  evaluations: Evaluation[];
  audit: AuditEvent[];
  periods: Period[];
};
