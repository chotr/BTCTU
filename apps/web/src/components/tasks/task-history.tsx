"use client";

import { personName } from "@/lib/shared/names";
import { fmtDateTime } from "@/lib/format";
import { Card } from "@/components/ui";
import type { AppState } from "@/lib/store";
import type { Task } from "@/lib/types";

/** "Lịch sử nhiệm vụ" card: append-only task history. */
export function TaskHistory({
  task,
  state,
}: {
  task: Task;
  state: AppState;
}) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 text-sm font-semibold">Lịch sử nhiệm vụ</h2>
      <ol className="space-y-4">
        {task.history.toReversed().map((h) => (
          <li key={h.id} className="text-xs">
            <p className="font-semibold">{h.action}</p>
            <p className="mt-1 leading-relaxed text-ink-2">{h.note}</p>
            <p className="mt-1 text-ink-3">
              {personName(state, h.actorId) ?? h.actorId} ·{" "}
              {fmtDateTime(h.at)}
            </p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
