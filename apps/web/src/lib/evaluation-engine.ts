/**
 * Barrel tương thích cho engine đánh giá. Phần triển khai nay nằm trong các
 * module domain chuyên biệt (thuần túy, không tác dụng phụ):
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
