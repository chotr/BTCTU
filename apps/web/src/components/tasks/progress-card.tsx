"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button, Card, Field, Input, Progress } from "@/components/ui";
import type { Task } from "@/lib/types";

/** Thẻ "Tiến độ": thanh tiến độ và (dành cho người được giao) cập nhật tiến độ. */
export function ProgressCard({
  task,
  owner,
  editable,
}: {
  task: Task;
  owner: boolean;
  editable: boolean;
}) {
  const [progress, setProgress] = useState(String(task.progress));
  return (
    <Card className="p-5">
      <div className="mb-3 flex justify-between text-sm">
        <h2 className="font-semibold">Tiến độ</h2>
        <span className="tabular-nums">{task.progress}%</span>
      </div>
      <Progress value={task.progress} />
      {owner && editable && (
        <div className="mt-4 space-y-2">
          <Field label="Cập nhật tiến độ (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full"
            />
          </Field>
          <Button onClick={() => api.updateProgress(task.id, Number(progress))}>
            Lưu tiến độ
          </Button>
        </div>
      )}
    </Card>
  );
}
