import type { EvalStatus, TaskStatus } from "@/lib/types";

/**
 * Nguồn chân lý duy nhất cho các nhóm trạng thái vòng đời. Khi thêm một trạng
 * thái chỉ cần sửa các bảng này, không cần rải rác kiểm tra `if/switch` (OCP).
 */

/** Trạng thái nhiệm vụ mà thành viên/người thẩm định vẫn có thể chỉnh sửa. */
export const TASK_EDITABLE = [
  "ASSIGNED",
  "IN_PROGRESS",
  "RETURNED",
] as const satisfies readonly TaskStatus[];

/** Trạng thái nhiệm vụ đang chờ người thẩm định độc lập. */
export const TASK_IN_REVIEW = [
  "SUBMITTED",
  "REVIEWED",
] as const satisfies readonly TaskStatus[];

/** Trạng thái nhiệm vụ đã nghiệm thu/chốt. */
export const TASK_DONE = ["ACCEPTED", "LOCKED"] as const satisfies readonly TaskStatus[];

/** Trạng thái hồ sơ đánh giá vẫn có thể tính toán/xác nhận. */
export const EVAL_EDITABLE = [
  "DRAFT",
  "SUBMITTED",
] as const satisfies readonly EvalStatus[];

/** Trạng thái hồ sơ đánh giá đang chờ thẩm định. */
export const EVAL_IN_REVIEW = [
  "SUBMITTED",
  "REVIEWED",
] as const satisfies readonly EvalStatus[];

/** Trạng thái hồ sơ đánh giá đã quyết định/chốt (chỉ đọc). */
export const EVAL_FINAL = ["APPROVED", "LOCKED"] as const satisfies readonly EvalStatus[];

export const inGroup = (group: readonly string[], value: string): boolean =>
  group.includes(value);
