import {
  CLASS_LABELS,
  EVAL_STATUS_LABELS,
  TASK_STATUS_LABELS,
  type Classification,
  type EvalStatus,
  type TaskStatus,
} from "@/lib/types";
import { Badge } from "./badge";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const tone: Record<
    TaskStatus,
    "neutral" | "accent" | "ok" | "warn" | "danger"
  > = {
    ASSIGNED: "neutral",
    IN_PROGRESS: "accent",
    SUBMITTED: "warn",
    RETURNED: "danger",
    REVIEWED: "accent",
    ACCEPTED: "ok",
    LOCKED: "neutral",
    CANCELLED: "neutral",
  };
  return <Badge tone={tone[status]}>{TASK_STATUS_LABELS[status]}</Badge>;
}

export function ClassificationBadge({ value }: { value: Classification }) {
  const tone: Record<Classification, "ok" | "accent" | "warn" | "danger"> = {
    XUAT_SAC: "ok",
    TOT: "accent",
    HOAN_THANH: "warn",
    KHONG_HOAN_THANH: "danger",
  };
  return <Badge tone={tone[value]}>{CLASS_LABELS[value]}</Badge>;
}

export function EvalStatusBadge({ status }: { status: EvalStatus }) {
  const tone: Record<EvalStatus, "neutral" | "accent" | "ok" | "warn"> = {
    DRAFT: "neutral",
    SUBMITTED: "warn",
    REVIEWED: "accent",
    APPROVED: "ok",
    LOCKED: "neutral",
  };
  return <Badge tone={tone[status]}>{EVAL_STATUS_LABELS[status]}</Badge>;
}
