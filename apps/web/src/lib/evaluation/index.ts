import { caseActions } from "./cases";
import { calculationActions } from "./calculation";
import { workflowActions } from "./workflow";
import { periodActions } from "./periods";

export {
  canSelfEvaluate,
  canCalculateEvaluation,
  evaluationLabel,
  evaluationTotal,
} from "./shared";

/** Bề mặt lệnh đánh giá tổng hợp (hồ sơ, tính toán, quy trình, kỳ). */
export const evaluationActions = {
  ...caseActions,
  ...calculationActions,
  ...workflowActions,
  ...periodActions,
};
