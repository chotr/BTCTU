import { lifecycleActions } from "./lifecycle";
import { reviewActions } from "./review";
import { evidenceActions } from "./evidence";

export { RESULT_QUALITY, TASK_EDITABLE, taskPeriodLocked } from "./shared";

/** Composed task command surface (create/execute/review/evidence). */
export const taskActions = {
  ...lifecycleActions,
  ...reviewActions,
  ...evidenceActions,
};
