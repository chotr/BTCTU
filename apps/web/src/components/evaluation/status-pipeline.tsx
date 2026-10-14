"use client";

import { Card } from "@/components/ui";
import { EVAL_STATUS_LABELS, type EvaluationStatus } from "@/lib/types";

/** Bước tiến trình ngang của các trạng thái vòng đời đánh giá. */
export function StatusPipeline({ status }: { status: EvaluationStatus }) {
  return (
    <Card className="p-4">
      <ol className="flex flex-wrap gap-x-5 gap-y-3 text-xs">
        {Object.entries(EVAL_STATUS_LABELS).map(([key, label], index) => (
          <li
            key={key}
            className={`flex items-center gap-2 ${key === status ? "font-semibold text-accent-700" : "text-ink-3"}`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-ctl ${key === status ? "bg-accent-100" : "bg-fill-2"}`}
            >
              {index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
    </Card>
  );
}
