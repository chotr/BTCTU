import type { TASK_STATUSES } from "../constants/task-status";

export type TaskStatus = (typeof TASK_STATUSES)[number];
