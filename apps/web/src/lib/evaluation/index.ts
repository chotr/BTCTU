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

/** Composed evaluation command surface (cases, calculation, workflow, periods). */
export const evaluationActions = {
  ...caseActions,
  ...calculationActions,
  ...workflowActions,
  ...periodActions,
};
