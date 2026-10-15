import type { TaskStatus as ApiTaskStatus } from "@btctu/shared";
import type { CatalogItem } from "./catalog";

export type WebOnlyTaskStatus = "REVIEWED" | "LOCKED" | "CANCELLED";

export type TaskStatus = ApiTaskStatus | WebOnlyTaskStatus;

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
