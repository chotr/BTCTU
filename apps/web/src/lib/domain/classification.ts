import type { Classification, ConditionCheck, Evaluation } from "@/lib/types";

/** QĐ39-style score bands. A band alone never finalizes a classification. */
export const scoreBand = (score: number): Classification =>
  score >= 90
    ? "XUAT_SAC"
    : score >= 70
      ? "TOT"
      : score >= 50
        ? "HOAN_THANH"
        : "KHONG_HOAN_THANH";

const RANK: Record<Classification, number> = {
  KHONG_HOAN_THANH: 0,
  HOAN_THANH: 1,
  TOT: 2,
  XUAT_SAC: 3,
};

/** Returns problems that block a proposed classification; empty = eligible. */
export function classificationEligibility(
  score: number,
  conditions: ConditionCheck[],
  desired: Classification,
  quota: Evaluation["quotaApplicability"] = "UNKNOWN",
  quotaConfirmed = false,
): string[] {
  const problems: string[] = [];
  if (RANK[desired] > RANK[scoreBand(score)])
    problems.push("Mức đề xuất vượt dải điểm tính được.");
  if (
    desired !== "KHONG_HOAN_THANH" &&
    conditions.some((condition) => condition.blocking && !condition.passed)
  )
    problems.push("Còn điều kiện bắt buộc chưa đạt hoặc chưa xác nhận.");
  if (desired === "XUAT_SAC") {
    if (conditions.some((condition) => !condition.passed))
      problems.push(
        "Mức Xuất sắc yêu cầu toàn bộ điều kiện minh họa đã được xác nhận.",
      );
    if (quota === "UNKNOWN")
      problems.push(
        "Chưa xác định nhóm đối tượng/hạn mức Xuất sắc có áp dụng hay không.",
      );
    if (quota === "APPLIES" && !quotaConfirmed)
      problems.push("Hạn mức của nhóm so sánh chưa được xác nhận.");
  }
  return problems;
}
