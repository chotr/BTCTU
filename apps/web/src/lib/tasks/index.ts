import { lifecycleActions } from "./lifecycle";
import { reviewActions } from "./review";
import { evidenceActions } from "./evidence";

export { RESULT_QUALITY, TASK_EDITABLE, taskPeriodLocked } from "./shared";

/** Bề mặt lệnh nhiệm vụ tổng hợp (tạo/thực hiện/thẩm định/minh chứng). */
export const taskActions = {
  ...lifecycleActions,
  ...reviewActions,
  ...evidenceActions,
};
