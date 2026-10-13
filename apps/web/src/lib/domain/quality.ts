/** The only quality vocabulary accepted by task results and KPI scoring. */
export const RESULT_QUALITY = [
  "Đáp ứng tốt",
  "Đáp ứng",
  "Cần hoàn thiện",
  "Không đáp ứng",
] as const;

export type ResultQuality = (typeof RESULT_QUALITY)[number];

export const QUALITY_SCORE: Record<ResultQuality, number> = {
  "Đáp ứng tốt": 100,
  "Đáp ứng": 80,
  "Cần hoàn thiện": 50,
  "Không đáp ứng": 0,
};

export function qualityScore(level: string): number | null {
  return Object.hasOwn(QUALITY_SCORE, level)
    ? QUALITY_SCORE[level as ResultQuality]
    : null;
}
