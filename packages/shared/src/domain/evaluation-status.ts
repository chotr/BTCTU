import type { EVALUATION_STATUSES } from "../constants/evaluation-status";

export type EvaluationStatus = (typeof EVALUATION_STATUSES)[number];
