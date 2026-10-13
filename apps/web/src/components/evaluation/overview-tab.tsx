"use client";

import type { Evaluation, Task } from "@/lib/types";
import { KpiInputCard } from "./kpi-input-card";
import { CandidateScoreCard } from "./candidate-score-card";
import { ConditionsCard } from "./conditions-card";

/** Tab "Tính điểm & điều kiện": đầu vào KPI, tính điểm và các điều kiện. */
export function OverviewTab({
  ev,
  tasks,
  canCalc,
  canOverride,
}: {
  ev: Evaluation;
  tasks: Task[];
  canCalc: boolean;
  canOverride: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]">
      <div className="space-y-4">
        <KpiInputCard tasks={tasks} />
        <CandidateScoreCard
          ev={ev}
          canCalc={canCalc}
          canOverride={canOverride}
        />
      </div>
      <ConditionsCard ev={ev} canCalc={canCalc} />
    </div>
  );
}
