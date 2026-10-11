/**
 * Compatibility barrel for the evaluation engine. The implementation now lives
 * in focused domain modules (pure, side-effect free):
 *   - `@/lib/domain/scoring`        → calculateCandidate, roundScore, CANDIDATE_RULE
 *   - `@/lib/domain/classification` → scoreBand, classificationEligibility
 *   - `@/lib/domain/periods`        → taskInPeriod, evaluationTasks
 */
export {
  CANDIDATE_RULE,
  roundScore,
  calculateCandidate,
} from "@/lib/domain/scoring";
export {
  scoreBand,
  classificationEligibility,
} from "@/lib/domain/classification";
export { taskInPeriod, evaluationTasks } from "@/lib/domain/periods";
