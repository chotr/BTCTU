"use client";

import { Card, Progress } from "@/components/ui";
import { CLASS_LABELS, type Evaluation } from "@/lib/types";

/** Distribution of decided classifications. */
export function ClassificationDistribution({
  decided,
}: {
  decided: Evaluation[];
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold">Xếp loại đã quyết định</h2>
      <div className="space-y-4">
        {Object.entries(CLASS_LABELS).map(([id, label]) => {
          const count = decided.filter(
            (e) => e.decision?.classification === id,
          ).length;
          return (
            <div key={id}>
              <div className="mb-2 flex justify-between gap-2 text-xs">
                <span>{label}</span>
                <span className="font-semibold tabular-nums">{count}</span>
              </div>
              <Progress
                value={decided.length ? (count / decided.length) * 100 : 0}
              />
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-ink-3">
        Chỉ tính quyết định trong phạm vi truy cập, không tính đề xuất thành kết
        quả chính thức.
      </p>
    </Card>
  );
}
