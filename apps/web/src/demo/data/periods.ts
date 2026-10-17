import type { EvaluationPeriod } from "@/lib/types";

export const PERIODS: EvaluationPeriod[] = [
  {
    id: "p3",
    name: "Quý III/2026",
    range: "01/07/2026 – 30/09/2026",
    status: "ACTIVE",
    lockedAt: null,
  },
  {
    id: "p2",
    name: "Quý II/2026",
    range: "01/04/2026 – 30/06/2026",
    status: "LOCKED",
    lockedAt: "2026-07-05T09:00:00+07:00",
  },
];
